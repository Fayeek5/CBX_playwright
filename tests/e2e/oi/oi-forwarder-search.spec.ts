import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Forwarder Search flow', async ({ page }) => {

  await page.goto('/home');

  await page
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  const forwarderLink = page.getByRole('link', { name: 'Forwarders' });
  await forwarderLink.waitFor({ state: 'visible', timeout: 15000 });
  await forwarderLink.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  //
  // Move cursor away to dismiss the sidenav overlay
  //
  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');

  const forwarderCode = (
    await page
      .locator('[col-id="forwarderCode"] div.text-wrapper')
      .first()
      .textContent()
  )?.trim();

  expect(forwarderCode).toBeTruthy();

  console.log(
    'Searching Forwarder:',
    forwarderCode
  );

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .evaluate(el => (el as HTMLElement).click());

  await page.waitForLoadState('domcontentloaded');

  await page
    .getByPlaceholder('Filter...')
    .fill(forwarderCode!);

  await page
    .getByPlaceholder('Filter...')
    .press('Enter');

  await expect(
    page
      .getByRole('row', {
        name: new RegExp(forwarderCode!)
      })
      .locator('[col-id="forwarderCode"] div.text-wrapper')
  ).toContainText(forwarderCode!);

  console.log(
    'Forwarder search completed:',
    forwarderCode
  );
});
