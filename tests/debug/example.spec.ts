import { test, expect } from '../../fixtures/test-fixtures';

/**
 * Example authenticated test — a TEMPLATE for your use cases.
 * It runs under the "chromium" project, which means the login session from
 * auth.setup.ts is already applied: this test opens the app ALREADY logged in.
 *
 * Replace the body with real assertions once you share the use cases. Each
 * use case typically becomes one `test(...)` block (or a `test.describe`
 * group), driving the relevant Page Object.
 */
test.describe('Post-login landing', () => {
  test('loads an authenticated page', async ({ page, dashboardPage }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Confirms we are NOT bounced back to the login screen.
    expect(await dashboardPage.isLoaded()).toBeTruthy();
  });
});
