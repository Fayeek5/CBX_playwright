import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openClaims(page: Page) {
  await page.goto('/home');
  await page.waitForURL('**/home**', { timeout: 30000 });

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();

  const link = page.getByRole('link', { name: 'Claims' });
  await link.waitFor({ state: 'visible', timeout: 15000 });
  await link.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
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

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

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
