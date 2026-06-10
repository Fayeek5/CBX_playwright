import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item - Mark As workflow', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  await page
    .locator('[col-id="itemNo"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  await page
    .getByRole('menuitem', {
      name: 'Mark as'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Adopted'
    })
    .click();

  console.log('Marked as Adopted');

  await page.waitForLoadState('networkidle');

  await page
    .getByRole('menuitem', {
      name: 'Mark as'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Concept'
    })
    .click();

  console.log('Marked as Concept');

});
