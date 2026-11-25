import { expect, type Locator, type Page } from '@playwright/test';

/** Page Object for https://demo.playwright.dev/todomvc/ */
export class TodoPage {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly counter: Locator;
  readonly clearCompleted: Locator;
  readonly toggleAll: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.counter = page.getByTestId('todo-count');
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.toggleAll = page.getByLabel('Mark all as complete');
  }

  async goto() {
    await this.page.goto('');
    await expect(this.newTodo).toBeVisible();
  }

  async add(...titles: string[]) {
    for (const t of titles) {
      await this.newTodo.fill(t);
      await this.newTodo.press('Enter');
    }
  }

  item(title: string): Locator {
    return this.items.filter({ hasText: title });
  }

  async toggle(title: string) {
    await this.item(title).getByRole('checkbox').check();
  }

  async remove(title: string) {
    const row = this.item(title);
    await row.hover();
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  async edit(oldTitle: string, newTitle: string) {
    await this.item(oldTitle).dblclick();
    const editor = this.page.getByRole('textbox', { name: 'Edit' });
    await editor.fill(newTitle);
    await editor.press('Enter');
  }

  async filter(name: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name, exact: true }).click();
  }
}
