import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';
const XLSX = require('xlsx');

export async function runInspectionReport(page: Page) {

  await page.goto('/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

  await page.locator('.tab-list > button:nth-child(8)')
    .click();

  await expect(
    page.getByRole('link', {
      name: 'Inspection Reports'
    })
  ).toBeVisible({
    timeout: 30000
  });

  await page.getByRole('link', {
    name: 'Inspection Reports'
  }).click();

  await demoPause(page);

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

  await search(page, reportNo!, 0);

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

  const download =
    await exportSelectedRows(page);

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

  console.log(
    'Inspection Report completed:',
    reportNo
  );
}
