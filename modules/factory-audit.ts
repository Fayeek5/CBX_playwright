import { Page, expect } from '@playwright/test';
const XLSX = require('xlsx');

export async function runFactoryAudit(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(2000);
  await page.waitForTimeout(5000);

  await page.waitForTimeout(3000);

  await page.locator('.tab-list > button:nth-child(8)')
    .click({ force: true });

  await page.getByRole('link', {
    name: 'Factory Audits'
  }).click();

  await page.waitForTimeout(5000);

  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log(
    'Factory Audit Records:',
    recordsText
  );

  expect(recordsText)
    .toContain('Records');

  const reportNo = (
    await page.locator(
      '[col-id="reportNo"] a'
    )
      .first()
      .textContent()
  )?.trim();

  console.log(
    'Report No:',
    reportNo
  );

  expect(reportNo)
    .toBeTruthy();

  await page.mouse.click(1200, 200);

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
      '[col-id="reportNo"] a'
    ).first()
  ).toContainText(reportNo!);

  console.log(
    'Verified Report search:',
    reportNo
  );

  await page.waitForTimeout(5000);

  await page.getByLabel('', {
    exact: true
  }).nth(1).check();

  await page.waitForTimeout(5000);

  await page.locator(
    'app-export-data > .edit-toggle'
  ).click();

  await page.waitForTimeout(3000);

  await page.getByRole('checkbox', {
    name: 'Selected Rows Only'
  }).check();

  await page.waitForTimeout(3000);

  const downloadPromise =
    page.waitForEvent('download');

  await page.getByRole('button', {
    name: 'Export'
  }).click();

  const download =
    await downloadPromise;

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

  await page.locator(
    '[col-id="reportNo"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await expect(page)
    .toHaveURL(
      /\/document\/quality\/factAudit\//
    );

  await expect(page)
    .toHaveURL(
      new RegExp(reportNo!)
    );

  console.log(
    'Opened Factory Audit URL:',
    page.url()
  );

  console.log(
    'Factory Audit completed:',
    reportNo
  );
}
