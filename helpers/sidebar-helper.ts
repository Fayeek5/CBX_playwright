import { Page } from '@playwright/test';

export async function closeSidebar(page: Page) {
  await page.locator('body').hover({
    position: { x: 1200, y: 200 }
  });

  await page.waitForTimeout(1000);
}
