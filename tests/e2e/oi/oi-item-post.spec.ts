import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item POST flow', async ({ page }) => {
  await page.goto('/listing/product/item/itemView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const itemLink = page.locator('div[col-id="itemNo"] a').first();

  const itemNo = (await itemLink.innerText()).trim();

  console.log('Searching Item:', itemNo);

  await itemLink.click();

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

const inactive = page.getByRole('menuitem', {
  name: 'Set to Inactive'
});

const active = page.getByRole('menuitem', {
  name: 'Set to Active'
});

if (await inactive.isVisible().catch(() => false)) {

  await inactive.click();

  console.log('Marked Inactive');

  await page.waitForTimeout(3000);

  await markAs.click();

  if (await active.isVisible().catch(() => false)) {

    await active.click();

    console.log('Marked Active');

  } else {

    console.log('Set to Active option not available');

  }

} else if (await active.isVisible().catch(() => false)) {

  await active.click();

  console.log('Marked Active');

} else {

  console.log('No status change options available');

}
});