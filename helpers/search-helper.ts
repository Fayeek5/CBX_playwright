import { Page, expect } from '@playwright/test';

export async function search(page: Page, value: string) {

  await page.mouse.click(1200, 200);

  await page.keyboard.press('Escape');

  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click({ force: true });

  const filterInput =
    page.getByPlaceholder('Filter...');

  await expect(filterInput)
    .toBeVisible({ timeout: 10000 });

  await filterInput.fill(value);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();
}
