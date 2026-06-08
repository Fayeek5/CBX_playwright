import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { demoPause } from '../helpers/demo-helper';

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

  await search(page, companyName!);

  await expect(
    page.locator('[col-id="companyName"] a')
      .first()
  ).toContainText(companyName!);

  console.log(
    'Forwarder completed:',
    forwarderId
  );
}
