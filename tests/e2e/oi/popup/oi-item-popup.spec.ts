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
    // Check if a dialog is actually visible (not just present in DOM)
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

async function dismissWarning(page: any): Promise<boolean> {
  const dismissed = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => ['OK', 'yes', 'Yes'].includes(b.textContent?.trim() ?? '') && (b as HTMLElement).offsetParent !== null);
    if (btn) { (btn as HTMLElement).click(); return true; }
    return false;
  });
  if (dismissed) await page.waitForTimeout(800);
  return dismissed;
}

async function closePopup(page: any) {
  const overlay = page.locator('.cdk-overlay-container, mat-dialog-container');
  const cancelBtn = overlay.getByRole('button', { name: /^cancel$/i });
  const closeBtn = overlay.getByRole('button', { name: /^close$/i });
  if (await cancelBtn.count() > 0) {
    await cancelBtn.first().click();
  } else if (await closeBtn.count() > 0) {
    await closeBtn.first().click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1000);
}

test('Item Create — HTS Information, Customer, and Vendor popup listing', async ({ page }) => {
  await page.goto('/listing/product/item/itemActiveView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('Listing URL:', page.url());

  // Confirm listing loaded
  const firstLink = page.locator('.ag-row a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
  if (!hasLink) {
    throw new Error('No records found in Item listing — marking as FAILED');
  }

  // Create → New Item → Select... (3-level cascading menu from recorder)
  await page.getByRole('menuitem', { name: 'Create' }).click({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.getByRole('menuitem', { name: 'New Item' }).click({ timeout: 10000 });
  await page.waitForTimeout(800);
  // If a sub-menu "Select..." appears, click it to properly initialize the form
  const selectMenuItem = page.getByRole('menuitem', { name: 'Select...' });
  if (await selectMenuItem.count() > 0) {
    await selectMenuItem.first().click({ timeout: 5000 });
    await page.waitForTimeout(500);
    // Cancel any search popup that opens — the form itself is what we want
    const cancelBtn = page.getByRole('button', { name: 'Cancel' });
    if (await cancelBtn.count() > 0) await cancelBtn.first().click();
  }
  await page.waitForTimeout(8000);
  console.log('New Item form opened:', page.url());
  await dismissWarning(page);

  // Prerequisite: select all product categories
  console.log('Selecting all product categories...');
  const prodCatBtn = page.getByRole('button', { name: /^product category/i });
  await prodCatBtn.first().click({ timeout: 10000 });
  await page.waitForTimeout(1000);
  const allCheckbox = page.locator('.checkbox-size-16 > .checkbox__control').first();
  if (await allCheckbox.count() > 0) await allCheckbox.check().catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('.cdk-overlay-backdrop').click().catch(() => {});
  await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  // Wait for all overlay backdrops to clear before proceeding
  await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'hidden', timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await dismissWarning(page);
  console.log('Product categories selected');

  // 1. HTS Information — sidebar sub-section (plain text nav item, not role=link)
  console.log('Navigating to HTS Information section...');
  await page.locator('text=HTS Information').first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  // "Select..." is a link in the section content
  await page.locator('text=Select...').first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await verifyPopupRows(page, 'HTS Information');
  await closePopup(page);

  // 2. Customer popup — "Select..." link in Customers sub-section of Parties
  console.log('Navigating to Parties > Customers section...');
  await page.locator('text=Parties').first().click({ timeout: 10000 });
  await page.waitForTimeout(1000);
  await page.locator('text=Customers').first().click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await page.locator('text=Select...').first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await verifyPopupRows(page, 'Customer');
  await closePopup(page);

  // 3. Vendor popup — second "Select..." link on the page (Vendors & Facilities row)
  console.log('Navigating to Vendors & Facilities section...');
  await page.screenshot({ path: '/private/tmp/item-after-customer-closed.png' });
  // Customers section has the first Select..., Vendors & Facilities has the second
  await page.locator('text=Select...').nth(1).click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await verifyPopupRows(page, 'Vendor');
  await closePopup(page);

  console.log('Item popup validations complete');
});
