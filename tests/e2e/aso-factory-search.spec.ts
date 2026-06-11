import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Factory Search flow', async ({ page }) => {

  await page.goto('https://aso-upgrade-qa.tradebeyond.com/home');

  //
  // Partners -> Factories
  //
  await page
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await page
    .getByRole('link', {
      name: 'Factories'
    })
    .click();

  //
  // Wait until Factory page is loaded
  //
  await expect(
    page.getByRole('heading', {
      name: 'Partners'
    })
  ).toBeVisible();

  //
  // Collapse side menu overlay
  //
  await page
    .locator('body')
    .click({
      position: {
        x: 1200,
        y: 300
      }
    });

  await page.waitForTimeout(2000);

  await page.waitForLoadState('networkidle');

  //
  // Close Partners menu overlay
  //
  await page.keyboard.press('Escape');

  await page.waitForTimeout(1000);

  //
  // Fetch Factory ID dynamically
  //
  const factoryId = (
    await page
      .locator('[col-id="factCode"] .text-wrapper')
      .first()
      .textContent()
  )?.trim();

  expect(factoryId).toBeTruthy();

  console.log(
    'Searching Factory ID:',
    factoryId
  );

  //
  // Search
  //
  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page
    .getByPlaceholder('Filter...')
    .fill(factoryId!);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  //
  // Verify filtered result
  //
  await expect(
    page.getByRole('gridcell', {
      name: factoryId!
    })
  ).toBeVisible();

  //
  // Fetch Factory Name dynamically
  //
  const factoryName = (
    await page
      .locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  expect(factoryName).toBeTruthy();

  console.log(
    'Factory Name:',
    factoryName
  );

  //
  // Open Factory
  //
  await page
    .getByRole('link', {
      name: factoryName!
    })
    .click();

  await page.waitForLoadState('networkidle');

  console.log(
    'Factory search completed:',
    factoryId
  );

  console.log(
    'Opened URL:',
    page.url()
  );

});
