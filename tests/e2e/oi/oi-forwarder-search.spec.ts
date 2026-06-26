import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Forwarder Search flow', async ({ page }) => {

  await page.goto('/listing/master/forwarder/forwView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const forwarderLink = page.locator('[col-id="forwarderCode"] a').first();
  const forwarderCode = (await forwarderLink.textContent())?.trim();

  expect(forwarderCode).toBeTruthy();

  console.log('Searching Forwarder:', forwarderCode);

  try {
    await page.locator('[col-id="forwarderCode"] .filter-button button').click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(forwarderCode!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  await expect(
    page.locator('[col-id="forwarderCode"] a').first()
  ).toContainText(forwarderCode!);

  console.log('Forwarder search completed:', forwarderCode);

  await page.locator('[col-id="forwarderCode"] a').first().click();
  await page.waitForURL('**/document/master/forwarder/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Opened URL:', page.url());
});
