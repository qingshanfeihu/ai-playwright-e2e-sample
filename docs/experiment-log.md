# Experiment log (real runs)

Environment: Linux 6.12, Node v24.22.1, @playwright/test 1.65.1, @modelcontextprotocol/sdk 1.32.2,
TypeScript 7.0.2, tsx 4.23.15, Chromium (playwright install). Target: https://demo.playwright.dev/todomvc/
Date: 2026-11-25 (JST). All numbers below come from actual runs on this machine.

## E1. Baseline suite
- `npx playwright test` → 6 passed (hand-written + seed), first run, 4.1s.
- After generation: `CI=1 npx playwright test` → 8 passed (2.3s).
- Stability: `--repeat-each=10 --retries=0` → expected 80 / unexpected 0 / flaky 0.
- Clean clone: `npm ci && typecheck && review:generated && CI=1 playwright test` → 8 passed.

## E2. `npx playwright init-agents --loop=claude`
Created: specs/README.md, .claude/agents/playwright-test-{planner,generator,healer}.md, .mcp.json
(`npx playwright run-test-mcp-server`). The server exposed 92 tools (planner_*, generator_*, test_run,
test_debug, test_list, browser_*).

## E3. Failures hit while scripting the MCP flow (and fixes)
1. Regex for the snapshot ref failed: the line was `textbox "What needs to be done?" [active] [ref=e8]`
   (extra `[active]` attribute). Fix: `.*?\[ref=(\w+)\]`.
2. `browser_verify_text_visible` rejected the call: `invalid_type ... path: ["intent"] ... expected string`.
   Fix: always pass `intent`.
3. `browser_check` → `Tool "browser_check" not found` in the generator session, although it appeared in
   tools/list of a fresh session. Fix: use `browser_click` on the checkbox.

## E4. Generated assertion weaker than the plan
Plan step: 「残り件数が 2 items left と表示される」 → `browser_verify_text_visible({text:"2 items left"})`.
Recorded code: `await expect(page.getByTestId('todo-count')).toBeVisible();` (text not checked).
Raw outputs kept in docs/raw-generated/. `review-generated.ts` flagged 2 findings (exit 1); `--fix`
rewrote them to `toHaveText('…')`.

Mutation test (tests/experiments/weak-assertion.spec.ts; the "check" step removed = bug):
- weak `toBeVisible()` → PASSED (bug missed)
- strong `toHaveText('0 items left')` → FAILED: `unexpected value "1 item left"` (bug caught)

## E5. Flaky waits (simulated slow first render, random 0–1500ms; tests/experiments/flaky-waits.spec.ts)
`--repeat-each=20 --retries=0 --workers=4`:
| test | passed | failed |
|---|---|---|
| `expect(await isVisible()).toBe(true)` right after goto | 0 | 20 |
| `waitForTimeout(800)` then `isVisible()` | 9 | 11 |
| web-first `await expect(locator).toBeVisible()` | 20 | 0 |

Same waitForTimeout test with `--retries=2`: expected 13 / unexpected 0 / **flaky 7** → retries made the
run green and hid a 55%-failure test. Hence the CI `flake-hunt` job uses `--retries=0`.

## E6. Locator drift (simulated UI copy change; tests/experiments/locator-drift.spec.ts)
Placeholder changed to 「新しいタスクを入力」 via route. Via MCP `test_run`:
- generated `getByRole('textbox', { name: 'What needs to be done?' })` → TimeoutError 3000ms
- `getByRole('textbox').first()` → passed
`error-context.md` contained the failure, instructions and an ARIA snapshot showing
`textbox "新しいタスクを入力" [ref=e8]` — the input a healer agent reasons over.

## E7. Ambiguous role-only locator (tests/experiments/ambiguous-role.spec.ts)
After adding 「牛乳を買う」 and double-clicking it: textbox count 1 → 2.
`page.getByRole('textbox').fill(...)` → `strict mode violation: getByRole('textbox') resolved to 2 elements:
1) <input class="new-todo" placeholder="What needs to be done?"/> 2) <input class="edit" value="牛乳を買う" aria-label="Edit"/>`.
So the `.first()` "fix" from E6 is only safe while a single textbox exists.
In E6, `locator('input.new-todo')` also passed under the copy change (trade-off: coupled to CSS class).

## E8. Japanese input boundaries (tests/experiments/japanese-input.spec.ts)
- '  半角スペース  ', '\u3000全角スペース\u3000', 'ＡＢＣ１２３' → displayed as ['半角スペース', '全角スペース', 'ＡＢＣ１２３'] (both kinds of spaces trimmed, full-width alnum kept) → passed
- '   ' and '\u3000\u3000' → no item added → passed

## E9. storageState reuse (tests/experiments/storage-state.spec.ts)
Added 「準備済みデータ」, saved `context.storageState()`, opened a new context with it → item present → passed (719ms).
