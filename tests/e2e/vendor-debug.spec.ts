import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Vendor debug', async ({ page }) => {

  await page.goto('https://oi-uat.tradebeyond.com/home');

  await page.locator('button:nth-child(9)').click();
  await page.getByRole('link', { name: 'Vendors' }).click();

  await page.waitForTimeout(5000);

  const cols = await page.locator('[col-id]').evaluateAll(
    els => [...new Set(els.map(e => e.getAttribute('col-id')))]
  );

  console.log('COL IDS =', cols);

  await page.pause();
});
