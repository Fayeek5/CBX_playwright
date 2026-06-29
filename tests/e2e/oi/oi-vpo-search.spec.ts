import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('VPO Search flow', async ({ page }) => {
  await page.goto('/listing/order/vpo/vpoView');

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible({ timeout: 30000 });

  const vpoNoLink = page.locator('div[col-id="vpoNo"] a').first();
  const vpoNo = (await vpoNoLink.textContent())?.trim();
  const colId = await vpoNoLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(vpoNo).toBeTruthy();

  console.log('Searching VPO:', vpoNo);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(vpoNo!);

  await page.getByRole('button', { name: 'Apply' }).click();

  await expect(
    page.locator('div[col-id="vpoNo"] a').first()
  ).toContainText(vpoNo!);

  console.log('VPO search completed:', vpoNo);
});
