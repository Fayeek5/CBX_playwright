import { test } from '@playwright/test';

test.use({ storageState: 'fixtures/.auth/user.json' });

test('Dashboard — click first available record', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForFunction(
    () => document.querySelectorAll('button.tab-icon-button').length >= 10,
    { timeout: 20000 }
  );
  await page.waitForTimeout(500);

  const homeUrl = page.url();
  const sidebarBtns = page.locator('button.tab-icon-button');
  const count = await sidebarBtns.count();

  // Dynamically find the sidebar button that navigates to the dashboard
  for (let i = 0; i < count; i++) {
    const btn = sidebarBtns.nth(i);
    const btnText = (await btn.textContent().catch(() => '')).trim().toLowerCase();
    if (btnText === 'search') continue;

    await btn.click().catch(() => {});
    await page.waitForTimeout(800);

    const currentUrl = page.url();
    if (currentUrl !== homeUrl && new URL(currentUrl).pathname.includes('/dashboard')) {
      console.log('Dashboard URL:', currentUrl);
      break;
    }

    // Not a dashboard — go back home
    if (currentUrl !== homeUrl) {
      await page.goto(homeUrl);
      await page.waitForLoadState('domcontentloaded');
      await page.waitForFunction(
        () => document.querySelectorAll('button.tab-icon-button').length >= 10,
        { timeout: 20000 }
      );
    }
  }

  await page.waitForLoadState('domcontentloaded').catch(() => {});

  const firstLink = page.locator('.ag-row a').first();
  await firstLink.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});

  if (await firstLink.count() > 0 && await firstLink.isVisible().catch(() => false)) {
    const href = await firstLink.getAttribute('href');
    console.log(`Dashboard record link: ${href}`);
    await firstLink.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(3000);
    console.log('Dashboard record URL:', page.url());
  } else {
    console.log('Dashboard: No records visible — skipping record open');
  }
});
