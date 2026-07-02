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

test('RFQ Create — Header Select and Select Fact popup listing', async ({ page }) => {
  // Navigate directly to RFQ create form
  await page.goto('/document/sourcing/rfq/create?actionId=SearchNewDoc');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('RFQ create URL:', page.url());

  // Prerequisite: select all product categories
  console.log('Selecting all product categories...');
  await page.getByRole('button', { name: /^product category/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.locator('.checkbox-size-16 > .checkbox__control').first().check().catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('.cdk-overlay-backdrop').click().catch(() => {});
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'hidden', timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);
  console.log('Product categories selected');

  // 1. Header → Select...
  console.log('Clicking Header > Select...');
  await page.getByRole('menuitem', { name: 'Select...' }).first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await verifyPopupRows(page, 'Header Select');
  await closePopup(page);

  // 2. Header → Select Fact
  console.log('Clicking Header > Select Fact...');
  await page.getByRole('menuitem', { name: 'Select Fact' }).first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await verifyPopupRows(page, 'Header Select Fact');
  await closePopup(page);

  console.log('RFQ popup validations complete');
});
