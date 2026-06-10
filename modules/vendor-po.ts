import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';
const XLSX = require('xlsx');

export async function runVendorPO(page: Page) {

  await page.goto('/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

  await page.getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await expect(
    page.getByRole('link', {
      name: 'Vendor Purchase Orders'
    })
  ).toBeVisible({
    timeout: 30000
  });

  await page.getByRole('link', {
    name: 'Vendor Purchase Orders'
  }).click();

  await expect(page)
    .toHaveURL(/vpo/i);

  await demoPause(page);

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

  await search(page, vpoNo!);

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

  console.log(
    'Vendor PO completed:',
    vpoNo
  );
}
