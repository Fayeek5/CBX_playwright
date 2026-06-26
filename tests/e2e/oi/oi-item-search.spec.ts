import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Item Search flow', async ({ page }) => {
  await page.goto('/listing/product/item/itemView');

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible({ timeout: 30000 });

  const itemNo = (
    await page.locator('[col-id="itemNo"] a').first().textContent()
  )?.trim();

  expect(itemNo).toBeTruthy();

  console.log('Searching Item:', itemNo);

  try {
    await page.getByRole('button').filter({ hasText: 'filter_alt' }).nth(1).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(itemNo!);

  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(
    page.locator('[col-id="itemNo"] a').first()
  ).toContainText(itemNo!);

  console.log('Item search completed:', itemNo);
});
