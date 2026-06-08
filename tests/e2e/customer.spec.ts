import { test, expect } from '@playwright/test';
const XLSX = require('xlsx');

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Customer', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');
  await page.waitForTimeout(5000);

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', {
    name: 'Customers'
  }).click();

  await expect(page).toHaveURL(/custActiveView/);

  await page.waitForTimeout(5000);

  // Records validation
  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log('Customer Records:', recordsText);

  expect(recordsText).toContain('Records');

  // Capture Customer Name
  const customerName = (
    await page.locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  // Capture Customer ID
  const customerId = (
    await page.locator(
      '[col-id="custCode"] .text-wrapper'
    )
      .first()
      .innerText()
  ).trim();

  console.log('Customer Name:', customerName);
  console.log('Customer ID:', customerId);

  expect(customerName).toBeTruthy();
  expect(customerId).toBeTruthy();

  // Close Partners overlay
  await page.mouse.click(1200, 200);

  // Search by Customer Name
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(customerName!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(
    page.locator('[col-id="businessName"] a').first()
  ).toContainText(customerName!);

  console.log(
    'Verified Customer Name search:',
    customerName
  );

  await page.waitForTimeout(5000);

  // Clear Search
  await page.getByText('Clear Search.')
    .click();

  // Search by Customer ID
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(customerId.toLowerCase());

  await page.getByPlaceholder('Filter...')
    .press('Enter');

  await expect(
    page.locator('[col-id="custCode"] .text-wrapper')
      .first()
  ).toContainText(customerId);

  console.log(
    'Verified Customer ID search:',
    customerId
  );

  await page.waitForTimeout(5000);

  // Select row
  await page.getByLabel('', { exact: true })
    .nth(1)
    .check();

  // Export
  await page.locator(
    'app-export-data > .edit-toggle'
  ).click();

  await page.getByText(
    'Selected Rows Only'
  ).click();

  const downloadPromise =
    page.waitForEvent('download');

  await page.getByRole('button', {
    name: 'export'
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

  expect(exportText)
    .toContain(customerId);

  console.log(
    'Verified Customer ID in export:',
    customerId
  );

  // Open document
  await page.locator(
    '[col-id="businessName"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(/\/document\/master\/cust\//);

  await expect(page)
    .toHaveURL(
      new RegExp(customerId)
    );

  console.log(
    'Opened Customer URL:',
    page.url()
  );
});
