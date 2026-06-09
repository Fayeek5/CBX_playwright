import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';

export async function runItem(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await expect(
    page.locator('.tab-list .tab-icon-button').nth(4)
  ).toBeVisible({ timeout: 30000 });

  await page.locator('.tab-list .tab-icon-button').nth(4).click();

  const itemsLink =
    page.getByRole('link', {
      name: 'Items'
    });

  await expect(itemsLink)
    .toBeVisible({
      timeout: 30000
    });

  await itemsLink.click();

  await expect(page)
    .toHaveURL(
      /itemActiveView/,
      {
        timeout: 30000
      }
    );

  await demoPause(page);

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible();

  const itemNo = (
    await page.locator('[col-id="itemNo"] a')
      .first()
      .textContent()
  )?.trim();

  console.log(
    'Selected Item:',
    itemNo
  );

  await search(
    page,
    itemNo!
  );

  await expect(
    page.locator('[col-id="itemNo"] a')
      .first()
  ).toContainText(itemNo!);

  await page.getByLabel('', {
    exact: true
  }).nth(1).check();

  const download =
    await exportSelectedRows(page);

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  const itemLink =
    page.locator('[col-id="itemNo"] a')
      .first();

  await itemLink.click();

  await demoPause(page);

  await expect(page)
    .toHaveURL(/document\/product\/item/i);

  await expect(page.url())
    .toContain(itemNo!);

  console.log(
    'Verified Item No:',
    itemNo
  );

  console.log(
    'Opened Item URL:',
    page.url()
  );

  console.log(
    'Item completed'
  );
}
