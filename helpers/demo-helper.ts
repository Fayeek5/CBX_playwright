import { Page } from '@playwright/test';

export async function demoPause(page: Page) {
  await page.waitForTimeout(4000);
}
