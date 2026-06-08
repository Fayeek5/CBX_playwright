import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Vendor', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);

  // Partners
  await page.locator('button:nth-child(9)').click();

  // Vendors
  await page.getByRole('link', { name: 'Vendors' }).click();

  await expect(page).toHaveURL(/vendorActiveView/);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const recordsText = (
    await page.locator('.total-record-indicator').innerText()
  ).trim();

  const recordCount = parseInt(
    recordsText.match(/\d+/)?.[0] || '0',
    10
  );

  console.log('Vendor Records:', recordCount);

  expect(recordCount).toBeGreaterThan(0);

  await page.waitForTimeout(5000);

  await page.waitForTimeout(3000);

  // Close Partners menu overlay
  await page.mouse.click(1200, 200);

  await page.waitForLoadState('networkidle');

  // Record count
  await expect(page.getByText(/Records/i).first()).toBeVisible();

  // Search
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page.getByPlaceholder('Filter...').fill('V001004');

  await page.getByRole('button', { name: 'Apply' }).click();

  await page.waitForLoadState('networkidle');

  // Dynamic Vendor ID
  const vendorId = (
    await page.locator('div[col-id="vendorCode"] .text-wrapper')
      .first()
      .innerText()
  ).trim();

  console.log('Selected Vendor:', vendorId);

  expect(vendorId).toMatch(/^V/);

  // Export
  await page.getByLabel('', { exact: true }).nth(1).check();

  await page.locator('app-export-data > .edit-toggle').click();

  await page.getByText('Selected Rows Only').click();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: 'Export' }).click();

  const download = await downloadPromise;

  const downloadPath = await download.path();

  console.log('Export file:', download.suggestedFilename());
  console.log('Download path:', downloadPath);

  const XLSX = require('xlsx');

  const workbook = XLSX.readFile(downloadPath);

  const firstSheet =
    workbook.Sheets[workbook.SheetNames[0]];

  const data =
    XLSX.utils.sheet_to_json(firstSheet, {
      header: 1
    });

  const exportText = JSON.stringify(data);

  expect(exportText).toContain(vendorId);

  console.log(
    'Verified Vendor in export:',
    vendorId
  );
});
