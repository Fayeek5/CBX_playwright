import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('https://oi-upgrade-qa.tradebeyond.com/home');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();

const vpoMenu = page.getByRole('link', {
  name: 'Vendor Purchase Orders'
});

await vpoMenu.waitFor({
  state: 'visible',
  timeout: 30000
});

await vpoMenu.click({
  force: true
});

await page.mouse.move(1200,220,{steps:30});
await page.waitForTimeout(1000);

const vpo = page.locator('[col-id="vpoNo"] a').first();

await vpo.waitFor({
  state:'visible',
  timeout:30000
});

const vpoNo=(await vpo.innerText()).trim();

console.log('VPO:',vpoNo);

await vpo.click({
  force:true
});
  await page.waitForTimeout(5000);

const markAs = page.getByRole('menuitem', {
  name: 'Mark as'
});

if (!(await markAs.isVisible().catch(() => false))) {
  console.log('Mark as not present');
  return;
}

await expect(markAs).toBeVisible({
  timeout: 30000
});

await expect(markAs).toBeEnabled({
  timeout: 30000
});

await markAs.click();

await page.getByRole('menuitem', {
  name: 'Set to Inactive'
}).click();

console.log('Marked Inactive');

await page.waitForTimeout(5000);

await expect(markAs).toBeVisible({
  timeout: 30000
});

await expect(markAs).toBeEnabled({
  timeout: 30000
});

await markAs.click();

await page.getByRole('menuitem', {
  name: 'Set to Active'
}).click();

console.log('Marked Active');

return;
});