import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';

export async function runVendor(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.locator('button:nth-child(9)').click();

  await expect(
    page.getByRole('link', { name: 'Vendors' })
  ).toBeVisible({ timeout: 30000 });

  await page.getByRole('link', {
    name: 'Vendors'
  }).click();

  await expect(page)
    .toHaveURL(/vendorActiveView/, {
      timeout: 30000
    });

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const vendorId = (
    await page.locator(
      'div[col-id="vendorCode"] .text-wrapper'
    )
      .first()
      .innerText()
  ).trim();

  console.log('Selected Vendor:', vendorId);

  await search(page, vendorId);

  await expect(
    page.locator(
      'div[col-id="vendorCode"] .text-wrapper'
    ).first()
  ).toContainText(vendorId);

  console.log(
    'Vendor completed:',
    vendorId
  );
}
