import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('test', async ({ page }) => {
  await page.goto('https://oi-upgrade-qa.tradebeyond.com/home');
  await page.getByRole('button').filter({ hasText: /^$/ }).nth(3).click();
  await page.getByRole('link', { name: 'Vendor Purchase Orders' }).click();

  await closeSidebar(page);

  await page.locator('body').hover({
    position: { x: 1200, y: 200 }
  });

  await page.waitForTimeout(1000);
  const filterBtn = page.getByRole('button').filter({ hasText: 'filter_alt' }).nth(1);

  await filterBtn.hover();

  await page.waitForTimeout(500);

  await filterBtn.click();
  const vpoNo = (
    await page.locator('[col-id="vpoNo"] a').first().innerText()
  ).trim();

  console.log('VPO:', vpoNo);

  await page.getByPlaceholder('Filter...').click();
  await page.getByPlaceholder('Filter...').fill(vpoNo);
  await page.getByPlaceholder('Filter...').press('Enter');

  await page.getByRole('link', { name: vpoNo }).click();
});