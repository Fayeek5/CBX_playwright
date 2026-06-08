import { Page } from '@playwright/test';

export async function search(
  page: Page,
  value: string,
  filterIndex = 1
) {
  await page.mouse.click(1200, 200);

  await page.keyboard.press('Escape');

  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(filterIndex)
    .click({ force: true });

  await page.getByPlaceholder('Filter...')
    .fill(value);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();
}
