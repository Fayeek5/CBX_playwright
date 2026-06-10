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

  //
  // Create
  //
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

  await page.waitForLoadState('networkidle');

  console.log('Create completed');

  //
  // Mark As -> first option
  //
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

  await page.waitForLoadState('networkidle');

  console.log('Marked as Adopted');

  //
  // Mark As -> other option
  //
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

  await page.waitForLoadState('networkidle');

  console.log('Marked as Concept');

  //
  // Inactive
  //
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

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('menuitem', {
      name: 'Amend'
    })
  ).toHaveCount(0);

  console.log('Inactive verified');

  //
  // Active
  //
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

  await page.waitForLoadState('networkidle');

  await expect(
    page.getByRole('menuitem', {
      name: 'Amend'
    })
  ).toBeVisible();

  console.log('Active verified');

});
