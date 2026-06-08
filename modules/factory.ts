import { Page, expect } from '@playwright/test';

export async function runFactory(page: Page) {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.waitForLoadState('networkidle');

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', {
    name: 'Factories'
  }).click();

  await expect(page)
    .toHaveURL(/factActiveView/);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const companyName = (
    await page.locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  const companyLink = await page
    .locator('[col-id="businessName"] a')
    .first()
    .getAttribute('href');

  const factoryId =
    companyLink?.match(/\/fact\/(.*?)\//)?.[1];

  expect(factoryId).toBeTruthy();
  expect(companyName).toBeTruthy();

  console.log(
    'Factory completed:',
    factoryId
  );
}
