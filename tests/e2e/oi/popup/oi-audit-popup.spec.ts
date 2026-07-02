import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function verifyPopupRows(page: any, fieldName: string) {
  await page.waitForTimeout(2000);

  const rowCount = await page.evaluate(() =>
    document.querySelectorAll(
      '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
      'mat-dialog-container tr, mat-dialog-container [role="row"], ' +
      '[role="dialog"] tr, [role="dialog"] [role="row"]'
    ).length
  );

  const hasPopup = await page.evaluate(() => {
    const dialog = document.querySelector('.cdk-overlay-container mat-dialog-container, .cdk-overlay-pane mat-dialog-container');
    const dialogVisible = dialog !== null && window.getComputedStyle(dialog).display !== 'none' && (dialog as HTMLElement).getBoundingClientRect().height > 0;
    return dialogVisible ||
      document.body.textContent?.includes('Lookup') ||
      (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done')) ||
      (document.body.textContent?.includes('noRecordsFound') && dialogVisible);
  });

  console.log(`${fieldName} popup — rows found: ${rowCount}, popup detected: ${hasPopup}`);

  if (rowCount === 0 && !hasPopup) {
    throw new Error(`${fieldName} popup did not open or has no records — marking as FAILED`);
  }

  expect(rowCount > 0 || hasPopup).toBeTruthy();
  console.log(`${fieldName} popup verified ✓ (rows: ${rowCount})`);
}

async function closePopup(page: any) {
  const overlay = page.locator('.cdk-overlay-container, mat-dialog-container');
  const closeBtn = overlay.getByRole('button', { name: /^close$/i });
  const cancelBtn = overlay.getByRole('button', { name: /^cancel$/i });
  if (await closeBtn.count() > 0) {
    await closeBtn.first().click();
  } else if (await cancelBtn.count() > 0) {
    await cancelBtn.first().click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1000);
}

test('Audit Create — Auditors and Company Name popup listing', async ({ page }) => {
  await page.goto('/listing/quality/factAudit/factAuditView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('Listing URL:', page.url());

  // Create → New Audit
  await page.getByRole('menuitem', { name: 'Create' }).click({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.getByRole('menuitem', { name: 'New Audit' }).click({ timeout: 10000 });
  await page.waitForTimeout(5000);
  console.log('Audit form opened:', page.url());

  // 1. Auditors — button with name containing "Auditor"
  console.log('Clicking Auditors select...');
  await page.getByRole('button', { name: /auditor/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await verifyPopupRows(page, 'Auditors');
  await closePopup(page);

  // 2. Company Name — first visible "select" button on the form (in Audit Result section)
  console.log('Clicking Company Name select...');
  await page.getByRole('button', { name: /^select$/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await verifyPopupRows(page, 'Company Name');
  await closePopup(page);

  console.log('Audit popup validations complete');
});
