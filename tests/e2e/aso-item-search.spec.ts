import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item Search flow', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(3000);

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page
    .getByPlaceholder('Filter...')
    .waitFor({ state: 'visible' });

  await page
    .getByPlaceholder('Filter...')
    .fill('ITM2606-000038');

  await page.waitForTimeout(1000);

  await page.waitForTimeout(2000);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page.getByRole('row', {
      name: 'ITM2606-000038',
      exact: true
    })
  ).toBeVisible();

  console.log(
    'Item search completed'
  );

});
