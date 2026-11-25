# Quickstart (5 minutes)

Requirements: Node.js 20+ (tested on Node 24), internet access to https://demo.playwright.dev.

```bash
# 1. install
npm ci
npx playwright install --with-deps chromium

# 2. run the suite (hand-written + generated, 8 tests)
npm test
npm run report            # open the HTML report

# 3. regenerate tests from the plan through Playwright's test MCP server (no LLM needed)
npm run generate          # writes tests/generated/*.spec.ts
npm run review:generated  # FAILS: generated text checks are recorded as bare toBeVisible()
npm run review:fix        # strengthens them to toHaveText(...)
npm test

# 4. see the failure/flaky demos
npm run test:experiments  # some of these fail ON PURPOSE (see docs/experiment-log.md)
```

## Use it on your own app
1. Set `BASE_URL=https://your-app.example` (or edit `baseURL` in `playwright.config.ts`).
2. Replace `pages/TodoPage.ts` with a Page Object for your app and update `tests/seed.spec.ts`
   so it boots your app (login etc.) and stays green.
3. Write your plan in `specs/*.plan.json` (one step = intent + action + role/name + text).
   Write expected results as concrete text — vague expectations become weak assertions.
4. `npm run generate && npm run review:generated`, review the diff, commit.
5. Push: `.github/workflows/playwright.yml` runs typecheck → review gate → tests → report.

## With an AI agent (optional)
`.claude/agents/` and `.mcp.json` were created by `npx playwright init-agents --loop=claude`.
Re-run `npx playwright init-agents --loop=<claude|codex|copilot|opencode|vscode>` after upgrading
Playwright. Always run `npm run review:generated` on agent-written tests and review healer diffs.
