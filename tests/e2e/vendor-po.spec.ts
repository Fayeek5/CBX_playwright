import { test, expect } from '@playwright/test';
const XLSX = require('xlsx');

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Vendor Purchase Order', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');
  await page.waitForTimeout(5000);

  await page.getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await page.getByRole('link', {
    name: 'Vendor Purchase Orders'
  }).click();

  await expect(page)
    .toHaveURL(/vpo/i);

  await page.waitForTimeout(5000);

  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log('VPO Records:', recordsText);

  expect(recordsText)
    .toContain('Records');

  const vpoNo = (
    await page.locator('[col-id="vpoNo"] a')
      .first()
      .textContent()
  )?.trim();

  console.log('PO Number:', vpoNo);

  expect(vpoNo).toBeTruthy();

  // Close left menu overlay
  await page.mouse.click(1200, 200);

  // Search by PO Number
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(vpoNo!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(
    page.locator('[col-id="vpoNo"] a')
      .first()
  ).toContainText(vpoNo!);

  console.log(
    'Verified PO search:',
    vpoNo
  );

  await page.waitForTimeout(5000);

  // Select row
  await page.getByLabel('', { exact: true })
    .nth(1)
    .check();

  await page.waitForTimeout(5000);

  // Export
  await page.locator(
    'app-export-data > .edit-toggle'
  ).click();

  await page.waitForTimeout(3000);

  await page.getByText(
    'Selected Rows Only'
  ).click();

  await page.waitForTimeout(3000);

  const downloadPromise =
    page.waitForEvent('download');

  await page.getByRole('button', {
    name: 'Export'
  }).click();

  const download =
    await downloadPromise;

  await page.waitForTimeout(5000);

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  const workbook =
    XLSX.readFile(await download.path());

  const sheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

  const data =
    XLSX.utils.sheet_to_json(
      sheet,
      { header: 1 }
    );

  const exportText =
    JSON.stringify(data);

  expect(data.length)
    .toBeGreaterThan(1);

  console.log(
    'Verified export contains data'
  );

  // Open document
  await page.locator(
    '[col-id="vpoNo"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(/\/document\/order\/vpo\//);

  await expect(page)
    .toHaveURL(
      new RegExp(vpoNo!)
    );

  console.log(
    'Opened VPO URL:',
    page.url()
  );
});
