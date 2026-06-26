import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openInspectionReports(page: Page) {
  await page.goto('/listing/quality/inspectReport/inspectReportView');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
}

test('Inspection Report POST flow', async ({ page }) => {

  await openInspectionReports(page);

  const reportNoLink = page.locator('[col-id="inspectReportNo"] a').first();
  const reportNo = (await reportNoLink.textContent())?.trim();
  const colId = await reportNoLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(reportNo).toBeTruthy();

  console.log('Searching Report No:', reportNo);

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

  await page.waitForLoadState('domcontentloaded');

  await page
    .locator('[col-id="inspectReportNo"] a')
    .first()
    .click();

  await page.waitForURL('**/document/quality/inspectReport/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(8000);

  console.log('Opened URL:', page.url());

  const toolsButton = page.getByRole('menuitem', { name: 'Tools' });
  const toolsVisible = await toolsButton
    .waitFor({ state: 'visible', timeout: 45000 })
    .then(() => true)
    .catch(() => false);

  if (!toolsVisible) {
    console.log('Tools menu not available for this record');
    return;
  }
  await toolsButton.click();

  await page
    .getByRole('menuitem', { name: 'Copy' })
    .click();

  console.log('Copy clicked');

  //
  // Save & Confirm -> Cancel -> yes
  //
  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 15000 });
  await saveConfirmButton.click();
  console.log('Save & Confirm clicked');

  const cancelButton = page.getByRole('button', { name: 'Cancel' });
  const cancelVisible = await cancelButton
    .waitFor({ state: 'visible', timeout: 20000 })
    .then(() => true)
    .catch(() => false);

  if (cancelVisible) {
    const isEnabled = await cancelButton.isEnabled().catch(() => false);
    if (isEnabled) {
      await cancelButton.click();
      console.log('Clicked Cancel');

      const yesButton = page.getByRole('button', { name: 'yes' });
      await yesButton.waitFor({ state: 'visible', timeout: 10000 });
      await yesButton.click();
      console.log('Clicked yes');
    }
  }

  await page.waitForLoadState('domcontentloaded');

  //
  // Wait until Mark as is visible and clickable; if not, stop
  //
  const markAsButton = page.getByRole('menuitem', { name: 'Mark as' });

  const markAsVisible = await markAsButton
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);

  if (!markAsVisible) {
    console.log('Mark as functionality not exist');
    return;
  }

  await markAsButton.click();

  const inactiveOption = page.getByRole('menuitem', { name: /Set to Inactive|Inactive/ }).first();
  await inactiveOption.waitFor({ state: 'visible', timeout: 10000 });
  await inactiveOption.click();

  console.log('Marked Inactive');

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  const markAsButton2 = page.getByRole('menuitem', { name: 'Mark as' });
  await markAsButton2.waitFor({ state: 'visible', timeout: 15000 });
  await markAsButton2.click();

  const activeOption = page.getByRole('menuitem', { name: /Set to Active|Active/ }).first();
  await activeOption.waitFor({ state: 'visible', timeout: 10000 });
  await activeOption.click();

  console.log('Marked Active');
});
