import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openClaims(page: Page) {
  await page.goto('/listing/order/claim/claimView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('Claims Search flow', async ({ page }) => {

  await openClaims(page);

  const claimNo = (
    await page
      .locator('[col-id="claimNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(claimNo).toBeTruthy();

  console.log('Searching Claim No:', claimNo);

  try {
    await page.locator('app-header-cell').filter({ hasText: 'Claim No.' }).locator('.filter-button button').click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page
    .getByPlaceholder('Filter...')
    .fill(claimNo!);

  await page
    .getByRole('button', { name: 'Apply' })
    .click();

  await expect(
    page.locator('[col-id="claimNo"] a').first()
  ).toContainText(claimNo!);

  console.log('Search verified:', claimNo);

  await page
    .locator('[col-id="claimNo"] a')
    .first()
    .click();

  await page.waitForURL('**/document/order/claim/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Claims search completed:', claimNo);
  console.log('Opened URL:', page.url());
});
