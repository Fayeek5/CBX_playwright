import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('https://oi-upgrade-qa.tradebeyond.com/listing/product/item/itemView');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();
  await page.getByRole('link', { name: 'Items' }).click();

  await page.mouse.move(800, 400);

  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'ITM2401-000002' }).click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(10000);

  await page.getByRole('menuitem', { name: 'Tools' }).click();
  await page.getByRole('menuitem', { name: 'Copy' }).click();
  await page.getByRole('button', { name: 'Save & Confirm' }).click();
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
  name: 'Set to Inactive'
}).click();

await markAs.click();

await page.getByRole('menuitem', {
  name: 'Set to Active'
}).click();
});