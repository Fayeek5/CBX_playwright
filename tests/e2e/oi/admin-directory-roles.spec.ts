import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Admin Directory Roles Search flow', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Click sidebar icons until Admin submenu (Directory link) becomes visible
  const navButtons = page.locator('nav button, aside button, [class*="sidebar"] button, [class*="nav"] button');
  const btnCount = await navButtons.count();
  for (let i = 1; i < btnCount; i++) {
    await navButtons.nth(i).click();
    await page.waitForTimeout(600);
    if (await page.getByText('Directory', { exact: true }).first().isVisible().catch(() => false)) break;
  }

  // Click Directory → lands on Directory listing
  await page.getByText('Directory', { exact: true }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Close the sidebar panel by clicking main content area
  await page.mouse.click(700, 400);
  await page.locator('app-sidenav').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);

  // Click the Directory-Users dropdown button → shows sub-items (Users, Groups, Roles...)
  await page.getByRole('button', { name: 'Directory - Users' }).click();
  await page.waitForTimeout(500);

  // Click Roles from the dropdown
  await page.getByRole('button', { name: 'Roles' }).click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  console.log('Roles page URL:', page.url());

  // Check for records — fail fast if no data
  const firstLink = page.locator('[role="row"] a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);

  if (!hasLink) {
    throw new Error('No records found in Admin Directory Roles listing — marking as FAILED');
  }

  const value = (await firstLink.textContent())?.trim();
  const colId = await firstLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(value).toBeTruthy();
  console.log('Searching role:', value);

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

  await page.waitForURL(/\/setup\/role\/|\/document\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  console.log('Opened URL:', page.url());
});
