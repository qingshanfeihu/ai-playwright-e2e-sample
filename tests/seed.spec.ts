import { test, expect } from '@playwright/test';
import { TodoPage } from '../pages/TodoPage';

// Seed test: the starting point that AI agents (planner/generator/healer) use
// to learn how to boot the app. Keep it minimal and always green.
test('seed: app boots with empty list', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await expect(todo.items).toHaveCount(0);
});
