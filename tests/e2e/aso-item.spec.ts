import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item module opens', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  await expect(page).toHaveURL(/itemView/);

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible({
    timeout: 30000
  });

  const itemNo = (
    await page
      .locator('[col-id="itemNo"] a')
      .first()
      .textContent()
  )?.trim();

  console.log('ASO Item:', itemNo);

  await page
    .locator('[col-id="itemNo"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  console.log('Opened URL:', page.url());

  await page.pause();
});
