import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Vendor POST flow', async ({ page }) => {

  await page.goto('/listing/master/vendor/vendorView');

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible({
    timeout: 30000
  });

  await page
    .locator('[col-id="businessName"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  await page
    .getByRole('menuitem', {
      name: 'Tools'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Copy'
    })
    .click();

  await page.waitForLoadState('networkidle');

  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  await page
    .getByRole('button', {
      name: 'Cancel'
    })
    .click();

  await page
    .getByRole('button', {
      name: /yes/i
    })
    .click();

  console.log('Create completed');

  await page
    .getByRole('menuitem', {
      name: 'Mark as'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Inactive'
    })
    .click();

  console.log('Marked Inactive');

  await page.waitForTimeout(5000);

  await page
    .getByRole('menuitem', {
      name: 'Mark as'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Active'
    })
    .click();

  console.log('Marked Active');

});
