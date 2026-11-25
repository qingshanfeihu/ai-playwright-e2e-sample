import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

/**
 * ミューテーション実験: 生成テストから「チェックを付ける」操作を削除した
 * “バグ入り”手順で、弱いアサーションと強いアサーションのどちらが検出できるか。
 */
test.beforeEach(async ({ page }) => {
  await new TodoPage(page).goto();
  await page.getByRole('textbox', { name: 'What needs to be done?' }).fill('レビュー依頼');
  await page.getByRole('textbox', { name: 'What needs to be done?' }).press('Enter');
  // (mutation) await page.getByRole('checkbox', { name: 'Toggle Todo' }).click();
});

test('weak (MCP raw output): toBeVisible()', async ({ page }) => {
  await expect(page.getByTestId('todo-count')).toBeVisible();
});

test('strong (after review): toHaveText()', async ({ page }) => {
  await expect(page.getByTestId('todo-count')).toHaveText('0 items left', { timeout: 2000 });
});
