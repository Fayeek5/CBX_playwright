import { test, expect } from '@playwright/test';
const XLSX = require('xlsx');

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Inspection Report', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);
  await page.waitForTimeout(5000);

  await page.locator('.tab-list > button:nth-child(8)')
    .click();

  await page.getByRole('link', {
    name: 'Inspection Reports'
  }).click();

  await page.waitForTimeout(5000);

  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log(
    'Inspection Report Records:',
    recordsText
  );

  expect(recordsText)
    .toContain('Records');

  const reportNo = (
    await page.locator(
      '[col-id="inspectReportNo"] a'
    )
      .first()
      .textContent()
  )?.trim();

  console.log(
    'Inspection Report No:',
    reportNo
  );

  expect(reportNo)
    .toBeTruthy();

  await page.mouse.click(1200, 200);

  // Search
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(reportNo!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(
    page.locator(
      '[col-id="inspectReportNo"] a'
    ).first()
  ).toContainText(reportNo!);

  console.log(
    'Verified Report search:',
    reportNo
  );

  await page.waitForTimeout(5000);

  // Select row
  await page.getByLabel('', {
    exact: true
  }).nth(1).check();

  await page.waitForTimeout(5000);

  // Export icon
  await page.locator(
    'app-export-data > .edit-toggle'
  ).click();

  await page.waitForTimeout(3000);

  // Selected Rows Only
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

  expect(data.length)
    .toBeGreaterThan(1);

  console.log(
    'Verified export contains data'
  );

  // Open document
  await page.locator(
    '[col-id="inspectReportNo"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(
      /\/document\/quality\/inspectReport\//
    );

  console.log(
    'Opened Inspection Report URL:',
    page.url()
  );
});
