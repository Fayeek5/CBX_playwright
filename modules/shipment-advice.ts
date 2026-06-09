import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';
const XLSX = require('xlsx');

export async function runShipmentAdvice(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

  await page.getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await expect(
    page.getByRole('link', {
      name: 'Shipment Advices'
    })
  ).toBeVisible({
    timeout: 30000
  });

  await page.getByRole('link', {
    name: 'Shipment Advices'
  }).click();

  await demoPause(page);

  const recordsText = (
    await page.locator('.total-record-indicator')
      .innerText()
  ).trim();

  console.log(
    'Shipment Advice Records:',
    recordsText
  );

  expect(recordsText)
    .toContain('Records');

  const shipmentAdviceNo = (
    await page.locator(
      '[col-id="shipmentAdviceNo"] a'
    )
      .first()
      .textContent()
  )?.trim();

  console.log(
    'Shipment Advice No:',
    shipmentAdviceNo
  );

  expect(shipmentAdviceNo)
    .toBeTruthy();

  await search(page, shipmentAdviceNo!);

  await expect(
    page.locator(
      '[col-id="shipmentAdviceNo"] a'
    ).first()
  ).toContainText(shipmentAdviceNo!);

  console.log(
    'Verified Shipment Advice search:',
    shipmentAdviceNo
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
    '[col-id="shipmentAdviceNo"] a'
  ).first().click();

  await page.waitForLoadState(
    'networkidle'
  );

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(
      /\/document\/order\/shipmentAdvice\//
    );

  await expect(page)
    .toHaveURL(
      new RegExp(shipmentAdviceNo!)
    );

  console.log(
    'Opened Shipment Advice URL:',
    page.url()
  );

  console.log(
    'Shipment Advice completed:',
    shipmentAdviceNo
  );
}
