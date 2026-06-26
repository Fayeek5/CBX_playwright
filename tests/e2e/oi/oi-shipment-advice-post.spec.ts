import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Shipment Advice POST flow', async ({ page }) => {
  await page.goto('/listing/shipment/shipmentAdvice/shipmentAdviceView');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
  await page.getByRole('link', { name: 'Shipment Advice' }).click();

  await page.mouse.move(800, 400);

  await page.waitForTimeout(1000);
  const shipmentLink = page.locator('div[col-id="shipmentAdviceNo"] a').first();

  const shipmentNo = (await shipmentLink.innerText()).trim();

  console.log('Opening Shipment Advice:', shipmentNo);

  await shipmentLink.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(10000);

  await page.getByRole('menuitem', { name: 'Tools' }).click();
  await page.getByRole('menuitem', { name: 'Copy' }).click();
  await page.getByRole('button', { name: 'Save & Confirm' }).click();
  await page.waitForTimeout(5000);

await page.waitForTimeout(5000);

const markAs = page.getByRole('menuitem', {
  name: 'Mark as'
});

if (!(await markAs.isVisible().catch(() => false))) {
  console.log('Mark as functionality not exist');
  return;
}

await markAs.click();

await page.getByRole('menuitem', {
  name: 'Completed'
}).click();
  await page.getByRole('menuitem', { name: 'Mark as' }).click();
});