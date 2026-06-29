import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openAudits(page: Page) {
  await page.goto('/listing/quality/factAudit/factAuditView');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
}

test('Audit Search flow', async ({ page }) => {

  await openAudits(page);

  const reportNoLink = page.locator('[col-id="reportNo"] a').first();
  const reportNo = (await reportNoLink.textContent())?.trim();
  const colId = await reportNoLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(reportNo).toBeTruthy();

  console.log('Searching Audit Report No:', reportNo);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

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
