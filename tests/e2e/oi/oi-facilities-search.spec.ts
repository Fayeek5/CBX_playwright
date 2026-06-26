import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openFacilities(page: Page) {
  await page.goto('/listing/master/fact/factActiveView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('Facilities Search flow', async ({ page }) => {
  await openFacilities(page);

  await expect(
    page.getByRole('heading', {
      name: 'Partners'
    })
  ).toBeVisible();

  const factoryIdLink = page.locator('[col-id="factCode"] .text-wrapper').first();
  const factoryId = (await factoryIdLink.textContent())?.trim();
  const colId = await factoryIdLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(factoryId).toBeTruthy();

  console.log(
    'Searching Facility ID:',
    factoryId
  );

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

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

  const facilityNameLink = page.locator('[col-id="businessName"] a').first();
  const facilityName = (await facilityNameLink.textContent())?.trim();

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
