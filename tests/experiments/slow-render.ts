import type { Page } from '@playwright/test';

/**
 * サンプルシナリオ（シミュレーション）:
 * 「API が遅くて初期描画が遅れる画面」を再現するため、TodoMVC の bundle.js を
 * setTimeout で包み、0〜maxDelayMs のランダムな遅延の後にアプリを起動させる。
 * load イベントは即座に発火するが、入力欄は遅れて表示される。
 */
export async function slowRender(page: Page, maxDelayMs = 1500) {
  await page.route('**/js/bundle.js', async (route) => {
    const res = await route.fetch();
    const body = await res.text();
    const delay = Math.floor(Math.random() * maxDelayMs);
    await route.fulfill({
      response: res,
      body: `setTimeout(function(){\n${body}\n}, ${delay});`,
    });
  });
}
