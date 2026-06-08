import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { demoPause } from '../helpers/demo-helper';
import { exportSelectedRows } from '../helpers/export-helper';

export async function runForwarder(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await demoPause(page);

  await page.locator('button:nth-child(9)').click();

  await expect(
    page.getByRole('link', {
      name: 'Forwarders'
    })
  ).toBeVisible({
    timeout: 30000
  });

  await demoPause(page);

  await page.getByRole('link', {
    name: 'Forwarders'
  }).click();

  await expect(page)
    .toHaveURL(/forwView/, {
      timeout: 30000
    });

  await demoPause(page);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const companyName = (
    await page.locator('[col-id="companyName"] a')
      .first()
      .textContent()
  )?.trim();

  const forwarderId = (
    await page.locator(
      '[col-id="forwarderCode"] .text-wrapper'
    )
      .first()
      .innerText()
  ).trim();

  console.log('Company Name:', companyName);
  console.log('Forwarder ID:', forwarderId);

  await search(page, forwarderId);

  await expect(
    page.locator(
      '[col-id="forwarderCode"] .text-wrapper'
    ).first()
  ).toContainText(forwarderId);

  const forwarderLink =
    page.locator('[col-id="companyName"] a')
      .first();

  await expect(
    page.locator('[col-id="forwarderCode"] .text-wrapper')
      .first()
  ).toContainText(forwarderId);

  await page.waitForTimeout(2000);

  await page.getByLabel('', {
    exact: true
  }).nth(1).check();

  const download =
    await exportSelectedRows(page);

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  await forwarderLink.click();

  await demoPause(page);

  await expect(page)
    .toHaveURL(/document\/master\/forwarder/i);

  await expect(page.url())
    .toContain(forwarderId);

  await expect(
    page.getByRole('heading', {
      name: companyName!
    })
  ).toBeVisible();

  await expect(
    page.getByText(forwarderId, {
      exact: true
    })
  ).toBeVisible();

  console.log(
    'Verified Company Name:',
    companyName
  );

  console.log(
    'Verified Forwarder ID:',
    forwarderId
  );

  console.log(
    'Opened Forwarder URL:',
    page.url()
  );

  console.log(
    'Forwarder completed:',
    forwarderId
  );
}
