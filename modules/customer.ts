import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';

export async function runCustomer(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', {
    name: 'Customers'
  }).click();

  await expect(page)
    .toHaveURL(/custActiveView/);

  await demoPause(page);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const customerLink =
    page.locator('[col-id="businessName"] a')
      .first();

  const customerName = (
    await customerLink.textContent()
  )?.trim();

  const customerId = (
    await page.locator(
      '[col-id="custCode"] .text-wrapper'
    ).first().innerText()
  ).trim();

  console.log('Customer Name:', customerName);
  console.log('Customer ID:', customerId);

  await search(
    page,
    customerName!,
    0
  );

  await expect(customerLink)
    .toContainText(customerName!);

  console.log(
    'Verified search:',
    customerName
  );

  await page.getByText('Clear Search.')
    .click();

  await page.waitForTimeout(2000);

  await search(
    page,
    customerId.toLowerCase(),
    1
  );

  await expect(
    page.locator(
      '[col-id="custCode"] .text-wrapper'
    ).first()
  ).toContainText(customerId);

  console.log(
    'Verified Customer ID search:',
    customerId
  );

  await page.mouse.click(1200, 200);
  await page.keyboard.press('Escape');

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

  await customerLink.click();

  await demoPause(page);

  await expect(page)
    .toHaveURL(/document\/master\/cust/i);

  await expect(page.url())
    .toContain(customerId);

  await expect(
    page.locator(
      '#tabHeader-generalSection-sub0'
    ).getByText(customerName!)
  ).toBeVisible();

  await expect(
    page.getByText(customerId!, {
      exact: true
    })
  ).toBeVisible();

  console.log(
    'Verified Customer Name:',
    customerName
  );

  console.log(
    'Verified Customer ID:',
    customerId
  );

  console.log(
    'Opened Customer URL:',
    page.url()
  );

  console.log(
    'Customer completed:',
    customerId
  );
}
