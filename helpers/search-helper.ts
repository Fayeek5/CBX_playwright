import { Page, expect } from '@playwright/test';

export async function search(
  page: Page,
  value: string,
  filterIndex = 1
) {
  await page.waitForLoadState('networkidle');

  await page.keyboard.press('Escape').catch(() => {});
  await page.mouse.click(1200, 200).catch(() => {});

  const overlay = page.locator('.cdk-overlay-backdrop');

  if (await overlay.isVisible().catch(() => false)) {
    await overlay.click({ force: true }).catch(() => {});
    await overlay.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  const filterButton = page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(filterIndex);

  await expect(filterButton).toBeVisible({
    timeout: 30000
  });

  await filterButton.click({ force: true });

  const filterInput =
    page.getByPlaceholder('Filter...');

  await expect(filterInput).toBeVisible({
    timeout: 10000
  });

  await filterInput.fill(value);

  await page.getByRole('button', {
    name: 'Apply'
  }).click({ force: true });

  await page.waitForLoadState('networkidle');
}
