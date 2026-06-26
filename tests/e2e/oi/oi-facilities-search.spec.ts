import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openFacilities(page: Page) {
  await page.goto('/home');

  await page
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  const facilitiesLink = page.getByRole('link', { name: 'Facilities' });
  await facilitiesLink.waitFor({ state: 'visible', timeout: 15000 });
  await facilitiesLink.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  //
  // Move cursor away to dismiss the sidenav overlay
  //
  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('ASO Facilities Search flow', async ({ page }) => {
  await openFacilities(page);

  await expect(
    page.getByRole('heading', {
      name: 'Partners'
    })
  ).toBeVisible();

  const factoryId = (
    await page
      .locator('[col-id="factCode"] .text-wrapper')
      .first()
      .textContent()
  )?.trim();

  expect(factoryId).toBeTruthy();

  console.log(
    'Searching Facility ID:',
    factoryId
  );

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

  await expect(
    page.getByRole('gridcell', {
      name: factoryId!
    })
  ).toBeVisible();

  const facilityName = (
    await page
      .locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  expect(facilityName).toBeTruthy();

  console.log(
    'Facility Name:',
    facilityName
  );

  await page
    .getByRole('link', {
      name: facilityName!
    })
    .click();

  await page.waitForLoadState('networkidle');

  console.log(
    'Facilities search completed:',
    factoryId
  );

  console.log(
    'Opened URL:',
    page.url()
  );
});
