import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Logout', async ({ page }) => {
  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.getByRole('button', {
    name: 'UF'
  }).click();

  await page.getByRole('menuitem', {
    name: 'workspace.logOut'
  }).click();

  await expect(page).toHaveURL(/cas\/login/i);
});
