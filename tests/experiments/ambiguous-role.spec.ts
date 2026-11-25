import { test, expect } from '@playwright/test';
import { TodoPage } from '../../pages/TodoPage';

/** role だけのロケーターは、編集モードで textbox が 2 つになると曖昧になる。 */
test('textbox count during edit mode', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.add('牛乳を買う');
  console.log('textboxes before edit:', await page.getByRole('textbox').count());
  await todo.item('牛乳を買う').dblclick();
  console.log('textboxes in edit mode:', await page.getByRole('textbox').count());
  await page.getByRole('textbox').fill('上書き', { timeout: 2000 }); // strict mode check
});
