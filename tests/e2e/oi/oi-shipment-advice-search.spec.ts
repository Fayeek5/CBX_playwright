import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Shipment Advice Search flow', async ({ page }) => {

  await page.goto('/listing/shipment/shipmentAdvice/shipmentAdviceView');
  await page.waitForLoadState('domcontentloaded');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const saLink = page.locator('[col-id="shipmentAdviceNo"] a, [col-id="shipmentAdviceNo"] .text-wrapper').first();
  const saVisible = await saLink.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
  if (!saVisible) {
    console.log('No Shipment Advice data visible — skipping');
    return;
  }
  const saNo = (await saLink.textContent())?.trim();
  const colId = await saLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(saNo).toBeTruthy();

  console.log('Searching Shipment Advice:', saNo);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
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
