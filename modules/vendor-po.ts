import { Page, expect } from '@playwright/test';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';

export async function runVendorPO(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

  await page.getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await page.getByRole('link', {
    name: 'Vendor Purchase Orders'
  }).click();

  await expect(page)
    .toHaveURL(/vpo/i);

  await demoPause(page);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records');

  const vpoLink =
    page.locator('[col-id="vpoNo"] a')
      .first();

  const vpoNo = (
    await vpoLink.textContent()
  )?.trim();

  console.log('PO Number:', vpoNo);

  await page.mouse.click(1200, 200);

  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(vpoNo!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(vpoLink)
    .toContainText(vpoNo!);

  console.log(
    'Verified PO search:',
    vpoNo
  );

  await demoPause(page);

  await page.getByLabel('', {
    exact: true
  }).nth(1).check({ force: true });

  const download =
    await exportSelectedRows(page);

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  await vpoLink.click();

  await page.waitForLoadState('networkidle');

  await expect(page)
    .toHaveURL(/\/document\/order\/vpo\//);

  await expect(page.url())
    .toContain(vpoNo!);

  console.log(
    'Opened VPO URL:',
    page.url()
  );

  console.log(
    'Vendor PO completed:',
    vpoNo
  );
}
