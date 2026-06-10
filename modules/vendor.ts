import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';

export async function runVendor(page: Page) {

  await page.goto('/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

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

  await demoPause(page);

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

  await demoPause(page);

  // Export
  await page.getByLabel('', { exact: true })
    .nth(1)
    .check();

  await exportSelectedRows(page);

  await demoPause(page);

  const vendorLink = page
    .locator('[col-id="businessName"] a')
    .first();

  const vendorName = (
    await vendorLink.textContent()
  )?.trim();

  console.log('Vendor Name:', vendorName);

  await vendorLink.click();

  await demoPause(page);

  await expect(page)
    .toHaveURL(/document\/master\/vendor/i);

  await expect(page.url())
    .toContain(vendorId);

  console.log(
    'Verified Vendor Name:',
    vendorName
  );

  console.log(
    'Opened Vendor URL:',
    page.url()
  );

  console.log(
    'Vendor completed:',
    vendorId
  );
}
