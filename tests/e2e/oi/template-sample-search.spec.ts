import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Template Sample Related Search flow', async ({ page }) => {
  await page.goto('/listing/template/sampleTempl/sampleRequestTemplateView');
  await page.waitForLoadState('domcontentloaded');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const hasRecords = await page.getByText(/\d+\s+Records/i).waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasRecords) {
    throw new Error('No records found in Template Sample Related listing — marking as FAILED');
  }

  const nameLink = page.locator('[role="row"] a').first();
  await nameLink.waitFor({ state: 'visible', timeout: 15000 });
  const templateName = (await nameLink.textContent())?.trim();
  const colId = await nameLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(templateName).toBeTruthy();
  console.log('Searching template:', templateName);

  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(templateName!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  const resultRow = page.locator('[role="row"]').filter({ hasText: templateName! }).first();
  const rowLink = resultRow.locator('a').first();
  if (await rowLink.count() > 0) {
    await rowLink.click();
  } else {
    await resultRow.click();
  }

  await page.waitForURL('**/document/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  console.log('Opened URL:', page.url());
});
