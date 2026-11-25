# ai-playwright-e2e-sample

Zenn本『AIエージェント×Playwright E2E実践』のサンプルリポジトリです。本は著者の Zenn ページからどうぞ: https://zenn.dev/qingshanfeihu

(English) Sample repository for the Zenn book "AIエージェント×Playwright E2E実践".

A small, working starter that shows how to combine **Playwright Test**, **Playwright's test MCP server
(AI-agent assisted generation)**, a **review gate for generated tests**, and **GitHub Actions CI**.
Everything runs against the public demo app https://demo.playwright.dev/todomvc/.

Tested with Node 24, @playwright/test 1.65.1, TypeScript 7.0, @modelcontextprotocol/sdk 1.32.

See **QUICKSTART.md** for a 5-minute walkthrough.

## Quick start
```bash
npm ci
npx playwright install --with-deps chromium
npm test                 # hand-written + generated tests (8 tests)
npm run typecheck
```

## Layout
```
pages/TodoPage.ts              Page Object (role/test-id locators only)
tests/seed.spec.ts             Seed test used by AI agents to boot the app
tests/todo.spec.ts             Hand-written tests
tests/generated/               Tests produced via the MCP generator (reviewed)
tests/experiments/             Intentional failure/flaky demos (excluded by default)
specs/todo-basic.plan.json     Machine-readable test plan
scripts/mcp-generate.ts        Drives `playwright run-test-mcp-server` step by step (no LLM needed)
scripts/review-generated.ts    Fails when a plan's text check is not asserted by text (`--fix` strengthens)
scripts/mcp-run-tests.ts       Calls the MCP `test_run` tool (what a healer agent sees)
.claude/agents/ , .mcp.json    Created by `npx playwright init-agents --loop=claude`
.github/workflows/playwright.yml  CI: typecheck → review gate → tests → report artifact; manual flake hunt
docs/experiment-log.md         Real results: flaky-wait rates, mutation test, locator drift, strict-mode, JP input
```

## AI-assisted generation flow
1. Write/obtain a plan (`specs/*.plan.json`, or let the planner agent write `specs/*.md`).
2. `npm run generate` — for each step: `browser_snapshot` → `browser_type`/`browser_click`/
   `browser_verify_*` → `generator_read_log` → `generator_write_test`.
   With Claude Code/Copilot you can instead ask the `playwright-test-generator` agent to do the same.
3. `npm run review:generated` — **always review**. In our runs the generator recorded a text check as a
   bare `toBeVisible()`; the gate catches that (`npm run review:fix` to strengthen).
4. `npm test`, commit.

## Experiments
`npm run test:experiments` runs the deliberately failing demos. See `docs/experiment-log.md`.

## Notes
- `tsx` depends on esbuild; if your npm blocks install scripts, tsx still worked in our runs.
- The experiments simulate slow rendering and UI copy changes with `page.route`; they are sample
  scenarios, not production incidents.

## License
MIT — see `LICENSE`.
