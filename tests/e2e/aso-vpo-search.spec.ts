import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO VPO Search flow', async ({ page }) => {

  await page.goto('/listing/order/vpo/vpoView');

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .evaluate(el => (el as HTMLElement).click());

  await page.waitForTimeout(3000);

  await page
    .getByPlaceholder('Filter...')
    .fill('26IB26247_CR');

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page.getByRole('link', {
      name: '26IB26247_CR'
    })
  ).toBeVisible();

  console.log(
    'VPO search completed'
  );

});
