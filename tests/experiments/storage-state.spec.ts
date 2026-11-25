import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

/** 例: storageState で「準備済みの状態」を別コンテキストに引き継ぐ（ログイン状態の再利用と同じ仕組み） */
test('reuse prepared state via storageState', async ({ page, browser }, testInfo) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.add('準備済みデータ');
  const statePath = testInfo.outputPath('state.json');
  await page.context().storageState({ path: statePath });

  const ctx = await browser.newContext({ storageState: statePath, baseURL: testInfo.project.use.baseURL });
  const page2 = await ctx.newPage();
  const todo2 = new TodoPage(page2);
  await todo2.goto();
  await expect(todo2.items).toHaveText(['準備済みデータ']);
  await ctx.close();
});
