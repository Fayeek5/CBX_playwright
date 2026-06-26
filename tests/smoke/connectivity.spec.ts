import { test, expect } from '@playwright/test';

/**
 * Connectivity / reachability smoke tests.
 * These do NOT log in — they just confirm the OI UAT environment is up and
 * the app shell loads.
 */
test.describe('OI UAT smoke', () => {
  test('app root responds successfully', async ({ page }) => {
    const response = await page.goto('/');
    expect(response, 'No response received from base URL').not.toBeNull();
    expect(response!.status(), `Unexpected status ${response!.status()}`).toBeLessThan(400);
  });

  test('page renders successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).toBeVisible();
  });
});
