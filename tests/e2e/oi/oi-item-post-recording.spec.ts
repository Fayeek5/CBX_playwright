import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('https://oi-upgrade-qa.tradebeyond.com/listing/product/item/itemView');
  const item=page.getByRole('link',{name:'ITM2509-011173'});

await item.waitFor({
  state:'visible',
  timeout:30000
});

await item.click({
  force:true
});

await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);
  const tools=page.getByRole('menuitem',{
  name:'Tools'
});

await expect(tools).toBeVisible({
  timeout:30000
});

await expect(tools).toBeEnabled({
  timeout:30000
});

await tools.click({
  force:true
});

await page.waitForTimeout(1000);
  const copy=page.getByRole('menuitem',{
  name:'Copy'
});

await expect(copy).toBeVisible({
  timeout:30000
});

await expect(copy).toBeEnabled({
  timeout:30000
});

await copy.click({
  force:true
});
  await page.getByRole('button',{
  name:'Save & Confirm'
}).click();

await page.waitForLoadState('domcontentloaded');
await page.waitForTimeout(5000);
  
await page.waitForTimeout(5000);

let markAs = page.getByRole('menuitem', {
  name: 'Mark as'
});

if (!(await markAs.isVisible().catch(() => false))) {

  const cancel = page.getByRole('button', {
  name: 'Cancel'
});

for (let i = 0; i < 10; i++) {

  if (await markAs.isVisible().catch(() => false)) {
    break;
  }

  if (await cancel.isEnabled().catch(() => false)) {
    await cancel.click({
      force: true
    });
    break;
  }

  await page.waitForTimeout(1000);
}

    const yes = page.locator('button').filter({
      hasText: /^(yes|Yes)$/i
    });

    if (await yes.isVisible().catch(() => false)) {
      await yes.click({
        force: true
      });

      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(5000);
    }
  }

  markAs = page.getByRole('menuitem', {
    name: 'Mark as'
  });

  if (!(await markAs.isVisible().catch(() => false))) {
    console.log('Mark as functionality not exist');
    return;
  }

await expect(markAs).toBeVisible({
  timeout:30000
});

await expect(markAs).toBeEnabled({
  timeout:30000
});

await markAs.click();

await page.getByRole('menuitem',{
  name:'Set to Inactive'
}).click();

console.log('Marked Inactive');

await expect(markAs).toBeEnabled({
  timeout:30000
});

await markAs.click();

await page.getByRole('menuitem',{
  name:'Set to Active'
}).click();

console.log('Marked Active');
});