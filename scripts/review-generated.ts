/**
 * Review gate for AI/MCP-generated tests.
 *
 * Finding from running scripts/mcp-generate.ts (Playwright 1.65.1):
 * browser_verify_text_visible("2 items left") was recorded as
 *   await expect(page.getByTestId('todo-count')).toBeVisible();
 * which no longer checks the text. This gate fails when a plan's verifyText
 * step is not asserted with toHaveText/toContainText in the generated file.
 *
 * Usage:
 *   npx tsx scripts/review-generated.ts            # check only (exit 1 on findings)
 *   npx tsx scripts/review-generated.ts --fix      # strengthen toBeVisible() -> toHaveText(text)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const fix = process.argv.includes('--fix');
const planPath = process.argv.find((a) => a.endsWith('.json')) ?? 'specs/todo-basic.plan.json';
const plan = JSON.parse(readFileSync(planPath, 'utf8'));
let findings = 0;

for (const sc of plan.scenarios) {
  if (!existsSync(sc.file)) { console.log(`✗ ${sc.file}: missing`); findings++; continue; }
  let src = readFileSync(sc.file, 'utf8');
  for (const step of sc.steps.filter((s: any) => s.action === 'verifyText')) {
    const strong = new RegExp(`to(Have|Contain)Text\\(['"\`]${step.text}['"\`]\\)`);
    if (strong.test(src)) continue;
    findings++;
    console.log(`✗ ${sc.file}: "${step.intent}" is not asserted by text (expected toHaveText('${step.text}'))`);
    if (fix) {
      const block = new RegExp(`(// ${step.intent}\\n\\s*await expect\\(([^\\n]+)\\))\\.toBeVisible\\(\\);`);
      if (block.test(src)) {
        src = src.replace(block, `$1.toHaveText('${step.text}'); // strengthened by review-generated`);
        console.log(`  → fixed`);
        findings--;
      }
    }
  }
  if (fix) writeFileSync(sc.file, src);
}
console.log(findings ? `\n${findings} finding(s)` : '\nreview OK');
process.exit(findings ? 1 : 0);
