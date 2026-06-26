import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Item Search flow', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  await page.waitForLoadState('networkidle');

  await page.waitForLoadState('domcontentloaded');

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page
    .getByPlaceholder('Filter...')
    .waitFor({ state: 'visible' });

  const itemNo = (
    await page
      .locator('[col-id="itemNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(itemNo).toBeTruthy();

  console.log('Searching Item:', itemNo);

  await page
    .getByPlaceholder('Filter...')
    .fill(itemNo!);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page
      .locator('[col-id="itemNo"] a')
      .first()
  ).toContainText(itemNo!);

  console.log(
    'Item search completed'
  );

});
