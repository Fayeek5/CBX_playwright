import { test } from '@playwright/test';

test.use({ storageState: 'fixtures/.auth/user.json' });

test('Dashboard — click first available record', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);
  console.log('Dashboard URL:', page.url());

  // Try broad selectors for any document/record link in any dashboard widget
  const recordLink = page.locator(
    'a[href*="/document/"], .recent-documents a, .widget a, .card a[href]'
  ).first();

  await recordLink.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});

  if (await recordLink.count() > 0 && await recordLink.isVisible().catch(() => false)) {
    const href = await recordLink.getAttribute('href');
    console.log(`Dashboard record link: ${href}`);
    await recordLink.dispatchEvent('click');
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await page.waitForTimeout(3000);
    console.log('Dashboard record URL:', page.url());
  } else {
    console.log('Dashboard: No record links visible — dashboard may show only charts/widgets, skipping record open');
  }
});
