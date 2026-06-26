import { Page } from '@playwright/test';

export async function save(page: Page) {
  await page.getByRole('button',{name:/Save & Confirm/i}).click();
}
