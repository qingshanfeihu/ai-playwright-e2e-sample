import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

/** 例: 日本語入力の境界値（前後の半角・全角スペース、空白のみ） */
test('trims half-width and full-width spaces', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.add('  半角スペース  ', '\u3000全角スペース\u3000', 'ＡＢＣ１２３');
  await expect(todo.items).toHaveText(['半角スペース', '全角スペース', 'ＡＢＣ１２３']);
});

test('whitespace-only input is not added', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.add('   ', '\u3000\u3000');
  await expect(todo.items).toHaveCount(0);
});
