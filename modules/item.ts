import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';

export async function runItem(page: Page) {
  await page.goto('https://oi-uat.tradebeyond.com/home');

  await expect(
    page.locator('.tab-list .tab-icon-button').nth(4)
  ).toBeVisible({ timeout: 30000 });

  await page.locator('.tab-list .tab-icon-button').nth(4).click();

  await page.getByRole('link', {
    name: 'Items'
  }).click();

  await expect(page)
    .toHaveURL(/itemActiveView/);

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible();

  await search(
    page,
    'ITM2605-001316'
  );

  await expect(
    page.getByText('ITM2605-001316')
  ).toBeVisible();

  console.log('Item completed');
}
