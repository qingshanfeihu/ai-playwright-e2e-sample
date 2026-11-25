import { test, expect } from '@playwright/test';

/**
 * サンプルシナリオ（シミュレーション）: UI 文言変更によるロケーター破損。
 * bundle.js 内のプレースホルダー文言を書き換えて「仕様変更後の画面」を再現し、
 * 生成テストのロケーターが壊れる様子と、その失敗情報（healer が読む情報）を確認する。
 */
test.beforeEach(async ({ page }) => {
  await page.route('**/js/bundle.js', async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replaceAll('What needs to be done?', '新しいタスクを入力');
    await route.fulfill({ response: res, body });
  });
  await page.goto('');
});

test('generated locator after UI copy change', async ({ page }) => {
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('牛乳を買う', { timeout: 3000 });
});

test('role-only locator survives copy change', async ({ page }) => {
  const input = page.getByRole('textbox').first();
  await input.fill('牛乳を買う');
  await input.press('Enter');
  await expect(page.getByTestId('todo-item')).toHaveText(['牛乳を買う']);
});

test('class-based locator survives copy change (trade-off: depends on CSS class)', async ({ page }) => {
  const input = page.locator('input.new-todo');
  await input.fill('牛乳を買う');
  await input.press('Enter');
  await expect(page.getByTestId('todo-item')).toHaveText(['牛乳を買う']);
});
