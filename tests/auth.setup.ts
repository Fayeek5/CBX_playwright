import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { config } from '../utils/config';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Runs ONCE before the main test projects (declared as their dependency in
 * playwright.config.ts). It logs in with the UAT credentials and writes the
 * authenticated browser state to disk, so every other test starts already
 * logged in instead of repeating the login UI flow.
 */
setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists.
  const authDir = path.dirname(config.authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.open();
  await loginPage.login(config.username, config.password);

  // Confirm we actually reached an authenticated state before saving.
  await expect
    .poll(async () => dashboardPage.isLoaded(), {
      message: 'Login did not reach an authenticated page — check credentials/selectors.',
      timeout: 30_000,
    })
    .toBeTruthy();

  await page.context().storageState({ path: config.authFile });
});
