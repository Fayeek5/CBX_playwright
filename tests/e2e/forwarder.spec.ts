import { test, expect } from '@playwright/test';
const XLSX = require('xlsx');

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Forwarder', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');
  await page.waitForTimeout(5000);

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', {
    name: 'Forwarders'
  }).click();

  await expect(page)
    .toHaveURL(/forwView/);

  await page.waitForTimeout(5000);

  // Records
  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log('Forwarder Records:', recordsText);

  expect(recordsText)
    .toContain('Records');

  // Capture Company Name
  const companyName = (
    await page.locator('[col-id="companyName"] a')
      .first()
      .textContent()
  )?.trim();

  // Capture Forwarder ID
  const forwarderId = (
    await page.locator(
      '[col-id="forwarderCode"] .text-wrapper'
    )
      .first()
      .innerText()
  ).trim();

  console.log('Company Name:', companyName);
  console.log('Forwarder ID:', forwarderId);

  expect(companyName).toBeTruthy();
  expect(forwarderId).toBeTruthy();

  // Close overlay
  await page.mouse.click(1200, 200);

  // Search by Company Name
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(companyName!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(
    page.locator('[col-id="companyName"] a')
      .first()
  ).toContainText(companyName!);

  console.log(
    'Verified Company search:',
    companyName
  );

  await page.waitForTimeout(5000);

  // Clear Search
  await page.getByText('Clear Search.')
    .click();

  // Search by Forwarder ID
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(forwarderId);

  await page.getByPlaceholder('Filter...')
    .press('Enter');

  await expect(
    page.locator(
      '[col-id="forwarderCode"] .text-wrapper'
    ).first()
  ).toContainText(forwarderId);

  console.log(
    'Verified Forwarder ID search:',
    forwarderId
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
    .toContain(forwarderId);

  console.log(
    'Verified Forwarder ID in export:',
    forwarderId
  );

  // Open document
  await page.locator(
    '[col-id="companyName"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(
      /\/document\/master\/forwarder\//
    );

  await expect(page)
    .toHaveURL(
      new RegExp(forwarderId)
    );

  console.log(
    'Opened Forwarder URL:',
    page.url()
  );
});
