import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openAudits(page: Page) {
  await page.goto('/home');
  await page.waitForURL('**/home**', { timeout: 30000 });

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

  const link = page.getByRole('link', { name: 'Audits' });
  await link.waitFor({ state: 'visible', timeout: 15000 });
  await link.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('ASO Audit Search flow', async ({ page }) => {

  await openAudits(page);

  const reportNo = (
    await page
      .locator('[col-id="reportNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(reportNo).toBeTruthy();

  console.log('Searching Audit Report No:', reportNo);

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page
    .getByPlaceholder('Filter...')
    .fill(reportNo!);

  await page
    .getByRole('button', { name: 'Apply' })
    .click();

  await expect(
    page.locator('[col-id="reportNo"] a').first()
  ).toContainText(reportNo!);

  console.log('Search verified:', reportNo);

  await page
    .locator('[col-id="reportNo"] a')
    .first()
    .click();

  await page.waitForURL('**/document/quality/factAudit/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Audit search completed:', reportNo);
  console.log('Opened URL:', page.url());
});
