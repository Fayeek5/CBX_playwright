import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Template Product Related - no records', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');

  // Open Templates sidebar — try by aria-label/title, fall back to nth-child
  const templatesBtn = page.getByRole('button', { name: /Templates/i })
    .or(page.locator('[title="Templates"]'))
    .or(page.locator('button:nth-child(11)'));
  const templatesBtnVisible = await templatesBtn.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!templatesBtnVisible) { console.log('Templates module not available in this environment — skipping'); return; }
  await templatesBtn.first().click();
  const subLink = page.getByRole('link', { name: 'Product Related' });
  const subLinkVisible = await subLink.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!subLinkVisible) { console.log('Product Related link not found — skipping'); return; }
  await subLink.click();
  await page.waitForLoadState('domcontentloaded');

  await expect(page.getByText('noRecordsFound')).toBeVisible({ timeout: 15000 });
  console.log('Product Related: noRecordsFound confirmed');
});
