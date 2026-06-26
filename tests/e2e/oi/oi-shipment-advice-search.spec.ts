import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Shipment Advice Search flow', async ({ page }) => {

  await page.goto('/listing/shipment/shipmentAdvice/shipmentAdviceView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const saLink = page.locator('[col-id="shipmentAdviceNo"] a').first();
  await saLink.waitFor({ state: 'visible', timeout: 30000 });
  const saNo = (await saLink.textContent())?.trim();

  expect(saNo).toBeTruthy();

  console.log('Searching Shipment Advice:', saNo);

  try {
    await page.locator('app-header-cell').filter({ hasText: 'Shipment Advice No.' }).locator('.filter-button button').click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(saNo!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  await expect(
    page.locator('[col-id="shipmentAdviceNo"] a').first()
  ).toContainText(saNo!);

  console.log('Shipment Advice search completed:', saNo);

  await page.locator('[col-id="shipmentAdviceNo"] a').first().click();
  await page.waitForURL('**/document/**shipment**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Opened URL:', page.url());
});
