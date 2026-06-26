import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Vendor POST flow', async ({ page }) => {
  console.log('Before goto:', page.url());

  await page.goto('/listing/business/vendor/vendorView');

  console.log('After goto:', page.url());
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(5).click();
  await page.getByRole('link', { name: 'Vendors' }).click();

  await page.mouse.move(800, 400);

  await page.waitForTimeout(1000);

  await page.mouse.move(800, 400);

  await page.waitForTimeout(1000);
  await page.getByRole('row', { name: '"Unicorn Carpets" S.R.L. 8f6ebab6-e4cc-4a4c-ba8f-0b2d3bcd89aa' }).getByRole('link').click();

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
  name: 'Inactive'
}).click();

await markAs.click();

await page.getByRole('menuitem', {
  name: 'Active'
}).click();
});