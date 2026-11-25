import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

test.describe('TodoMVC (hand-written)', () => {
  let todo: TodoPage;

  test.beforeEach(async ({ page }) => {
    todo = new TodoPage(page);
    await todo.goto();
  });

  test('add items and see counter', async () => {
    await todo.add('牛乳を買う', '請求書を送る');
    await expect(todo.items).toHaveText(['牛乳を買う', '請求書を送る']);
    await expect(todo.counter).toHaveText('2 items left');
  });

  test('complete an item and filter', async () => {
    await todo.add('A', 'B', 'C');
    await todo.toggle('B');
    await expect(todo.counter).toHaveText('2 items left');
    await todo.filter('Completed');
    await expect(todo.items).toHaveText(['B']);
    await todo.filter('Active');
    await expect(todo.items).toHaveText(['A', 'C']);
  });

  test('edit and delete', async () => {
    await todo.add('typo itme');
    await todo.edit('typo itme', 'fixed item');
    await expect(todo.items).toHaveText(['fixed item']);
    await todo.remove('fixed item');
    await expect(todo.items).toHaveCount(0);
  });

  test('clear completed', async () => {
    await todo.add('x', 'y');
    await todo.toggleAll.check();
    await todo.clearCompleted.click();
    await expect(todo.items).toHaveCount(0);
  });

  test('state persists in localStorage after reload', async ({ page }) => {
    await todo.add('persist me');
    await page.reload();
    await expect(todo.items).toHaveText(['persist me']);
  });
});
