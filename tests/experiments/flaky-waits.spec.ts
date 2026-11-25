import { test, expect } from '@playwright/test';
import { slowRender } from './slow-render';

const input = (page: import('@playwright/test').Page) => page.getByPlaceholder('What needs to be done?');

test.beforeEach(async ({ page }) => {
  await slowRender(page, 1500);
  await page.goto('');
});

// アンチパターン1: 待たない真偽値チェック
test('anti-pattern: isVisible() immediately', async ({ page }) => {
  expect(await input(page).isVisible()).toBe(true);
});

// アンチパターン2: 固定時間待ち
test('anti-pattern: waitForTimeout(800) then isVisible()', async ({ page }) => {
  await page.waitForTimeout(800);
  expect(await input(page).isVisible()).toBe(true);
});

// 推奨: Web-first assertion（自動リトライ）
test('recommended: web-first toBeVisible()', async ({ page }) => {
  await expect(input(page)).toBeVisible();
});
