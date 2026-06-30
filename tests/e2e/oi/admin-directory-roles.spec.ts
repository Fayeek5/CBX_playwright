import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Admin Directory Roles Search flow', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('domcontentloaded');
  // Wait until the sidebar is fully rendered (more than 5 tab-icon buttons)
  await page.waitForFunction(
    () => document.querySelectorAll('button[class*="tab-icon-button"]').length > 5,
    { timeout: 15000 }
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Sidebar icon buttons have class "tab-icon-button" — iterate to find Admin icon
  // Start from index 1 to skip the search icon (index 0)
  const sidebarBtns = page.locator('button[class*="tab-icon-button"]');
  const btnCount = await sidebarBtns.count();
  console.log('Sidebar icon buttons:', btnCount);

  for (let i = 1; i < btnCount; i++) {
    await page.keyboard.press('Escape'); // close any open panels first
    await sidebarBtns.nth(i).click({ force: true }).catch(() => {});
    await page.waitForTimeout(800);
    const hasDir = await page.getByRole('link', { name: 'Directory' }).first().isVisible().catch(() => false);
    if (hasDir) {
      console.log('Admin icon found at index', i);
      break;
    }
  }

  // Click Directory link — sidenav stays open with sub-items
  await page.getByRole('link', { name: 'Directory' }).first().click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Click Directory - Users dropdown (JS click to bypass module-title overlay)
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.includes('Directory - Users'));
    (btn as HTMLButtonElement)?.click();
  });
  await page.waitForTimeout(800);
  // Click Roles sub-item
  await page.getByRole('button', { name: 'Roles' }).click({ force: true });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  // Close sidenav so it doesn't block grid interactions
  await page.mouse.click(700, 400);
  await page.locator('app-sidenav').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
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
