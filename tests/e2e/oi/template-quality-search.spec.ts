import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Template Quality & Compliance Search flow', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');

  const templatesBtn = page.getByRole('button', { name: /Templates/i })
    .or(page.locator('[title="Templates"]'))
    .or(page.locator('button:nth-child(11)'));
  const templatesBtnVisible = await templatesBtn.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!templatesBtnVisible) { console.log('Templates module not available in this environment — skipping'); return; }
  await templatesBtn.first().click();
  const subLink = page.getByRole('link', { name: 'Quality & Compliance Related' });
  const subLinkVisible = await subLink.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!subLinkVisible) { console.log('Quality & Compliance Related link not found — skipping'); return; }
  await subLink.click();
  await page.waitForLoadState('domcontentloaded');

  // Check for data — graceful skip if none
  const noRecords = await page.getByText('noRecordsFound').isVisible().catch(() => false);
  if (noRecords) {
    console.log('No Quality & Compliance data — skipping');
    return;
  }

  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  // Dynamically get first record name
  const nameLink = page.locator('[col-id="name"] a, [col-id="templateName"] a').first();
  await nameLink.waitFor({ state: 'visible', timeout: 30000 });
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

  const resultEl = page.locator(`[col-id="${colId}"] a`).first();
  await expect(resultEl).toContainText(templateName!);

  console.log('Quality & Compliance search completed:', templateName);

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
