import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Shipment Advice Search flow', async ({ page }) => {

  await page.goto('/');

  await page.waitForLoadState('networkidle');

  await page.waitForLoadState('domcontentloaded');

  await page
    .locator(
      '.tab-list button'
    )
    .nth(4)
    .click();

  await page
    .getByRole('link', {
      name: 'Shipment Advice'
    })
    .click();

  await page
    .locator(
      'app-sidenav .position-fixed.full-size-offset'
    )
    .click({ force: true });

  await page.waitForLoadState('domcontentloaded');

  await page.waitForLoadState('networkidle');

  await page.waitForSelector(
    '[col-id="shipmentAdviceNo"] a',
    { timeout: 30000 }
  );

  await page.waitForLoadState('domcontentloaded');

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
    .fill('SAV2602-000429');

  await page.waitForLoadState('domcontentloaded');

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page.getByRole('row', {
      name: /SAV2602-000429/
    })
  ).toBeVisible();

  console.log(
    'Shipment Advice search completed'
  );

});
