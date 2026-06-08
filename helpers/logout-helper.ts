import { Page, expect } from '@playwright/test';

export async function logout(page: Page) {
  await page.getByRole('button', {
    name: 'UF'
  }).click();

  await page.getByRole('menuitem', {
    name: 'workspace.logOut'
  }).click();

  await expect(page)
    .toHaveURL(/cas\/login/i);
}
