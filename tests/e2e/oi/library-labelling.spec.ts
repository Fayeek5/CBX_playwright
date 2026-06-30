import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Library Labelling Search flow', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    () => document.querySelectorAll('button[class*="tab-icon-button"]').length > 5,
    { timeout: 15000 }
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Find Library icon by iterating sidebar icon buttons
  const sidebarBtns = page.locator('button[class*="tab-icon-button"]');
  const btnCount = await sidebarBtns.count();
  for (let i = 1; i < btnCount; i++) {
    await page.keyboard.press('Escape');
    await sidebarBtns.nth(i).click({ force: true }).catch(() => {});
    await page.waitForTimeout(600);
    if (await page.getByText('Library', { exact: true }).first().isVisible().catch(() => false)) {
      console.log('Library icon found at index', i);
      break;
    }
  }

  // Fail immediately if Library module is not available on this environment
  const hasLibrary = await page.getByText('Library', { exact: true }).first().isVisible().catch(() => false);
  if (!hasLibrary) {
    throw new Error('Library module not available on this environment — marking as FAILED');
  }

  // Click Labeling link (UI label may be "Labeling" or "Labelling")
  const labelLink =
    (await page.getByRole('link', { name: 'Labelling' }).first().isVisible().catch(() => false))
      ? page.getByRole('link', { name: 'Labelling' }).first()
      : page.getByRole('link', { name: 'Labeling' }).first();
  await labelLink.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Close sidenav so it doesn't block grid
  await page.mouse.click(700, 400);
  await page.locator('app-sidenav').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');

  console.log('Labelling page URL:', page.url());

  // Check for records
  const firstLink = page.locator('[role="row"] a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);

  if (!hasLink) {
    throw new Error('No records found in Library Labelling — marking as FAILED');
  }

  const value = (await firstLink.textContent())?.trim();
  const colId = await firstLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(value).toBeTruthy();
  console.log('Searching labelling:', value);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(value!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  const resultRow = page.locator('[role="row"]').filter({ hasText: value! }).first();
  const rowLink = resultRow.locator('a').first();
  if (await rowLink.count() > 0) {
    await rowLink.click();
  } else {
    await resultRow.click();
  }

  await page.waitForURL(/\/document\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  console.log('Opened URL:', page.url());
});
