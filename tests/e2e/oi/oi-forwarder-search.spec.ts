import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Forwarder Search flow', async ({ page }) => {

  await page.goto('/listing/master/forwarder/forwView');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const forwarderEl = page.locator('[col-id="forwarderCode"] a, [col-id="forwarderCode"] .text-wrapper').first();
  await forwarderEl.waitFor({ state: 'visible', timeout: 30000 });
  const forwarderCode = (await forwarderEl.textContent())?.trim();
  const colId = await forwarderEl.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(forwarderCode).toBeTruthy();

  console.log('Searching Forwarder:', forwarderCode);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(forwarderCode!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  const resultEl = page.locator('[col-id="forwarderCode"] a, [col-id="forwarderCode"] .text-wrapper').first();
  await expect(resultEl).toContainText(forwarderCode!);

  console.log('Forwarder search completed:', forwarderCode);

  // click the row's first link (a tag) to navigate; .text-wrapper alone won't navigate
  const rowLink = page.locator('[role="row"]').filter({ hasText: forwarderCode! }).first().locator('a').first();
  const rowLinkExists = await rowLink.count() > 0;
  if (rowLinkExists) {
    await rowLink.click();
  } else {
    await page.locator('[role="row"]').filter({ hasText: forwarderCode! }).first().click();
  }
  await page.waitForURL('**/document/master/forwarder/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Opened URL:', page.url());
});
