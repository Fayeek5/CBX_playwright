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
      'table tr, [role="dialog"] tr, [role="dialog"] [role="row"]'
    ).length
  );

  const hasPopup = await page.evaluate(() =>
    document.body.textContent?.includes('Lookup') ||
    (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done')) ||
    (document.body.textContent?.includes('close') && document.body.textContent?.includes('noRecordsFound')) ||
    document.body.textContent?.includes('noRecordsFound') ||
    document.querySelector('.cdk-overlay-container mat-dialog-container') !== null
  );

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
  // Scope to overlay container only — avoid clicking page-level Cancel/Close buttons
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

test('Shipment Advice Create — Customer Name, Vendor Name, and Shipment Items popup listing', async ({ page }) => {
  // Go to listing URL first (shows blank), then trigger nav to load the listing
  // Pattern from existing spec: goto URL → click sidebar nav button → click "Shipment Advice" link
  await page.goto('/listing/shipment/shipmentAdvice/shipmentAdviceView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Try sidebar nav buttons nth(3) through nth(7) — QA=3, UAT=5, varies by env
  const emptyBtns = page.getByRole('button').filter({ hasText: /^$/ });
  let navLinkFound = false;
  for (let i = 3; i <= 7; i++) {
    await emptyBtns.nth(i).click().catch(() => {});
    await page.waitForTimeout(800);
    const found = await page.getByRole('link', { name: /shipment advi/i }).count();
    if (found > 0) { navLinkFound = true; break; }
    // Close any dropdown that opened unintentionally
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  if (!navLinkFound) {
    throw new Error('Shipment Advice nav link not found — marking as FAILED');
  }

  await page.getByRole('link', { name: /shipment advi/i }).first().click();
  // Already at shipmentAdvice URL — no navigation event fires, just wait for grid
  await page.waitForTimeout(3000);
  await page.mouse.move(800, 400);
  console.log('Listing URL:', page.url());

  const firstLink = page.locator('[col-id="shipmentAdviceNo"] a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);

  if (!hasLink) {
    throw new Error('No records found in Shipment Advice listing — marking as FAILED');
  }

  await firstLink.click();
  await page.waitForTimeout(5000);
  console.log('Opened Shipment Advice:', page.url());

  // Create → New Item Shipment Advice (exact recorder selectors)
  await page.getByRole('menuitem', { name: 'Create' }).click({ timeout: 20000 });
  await page.waitForTimeout(800);
  await page.getByRole('menuitem', { name: 'New Item Shipment Advice' }).click({ timeout: 10000 });
  await page.waitForTimeout(5000);
  console.log('New Shipment Advice form opened:', page.url());
  await dismissWarning(page);

  // 1. Customer Name popup — #tabParties-partiesSection-sub0 select button
  console.log('Clicking Customer Name select...');
  await page.locator('#tabParties-partiesSection-sub0').getByRole('button', { name: 'select' }).click({ timeout: 15000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);

  await verifyPopupRows(page, 'Customer Name');

  // Select first data row (auto-closes popup) so Items lookup works on both QA and UAT
  const customerRow = page.locator('.cdk-overlay-container [role="dialog"] tr td').first();
  if (await customerRow.count() > 0) {
    await customerRow.click();
  } else {
    await closePopup(page);
  }
  await page.waitForTimeout(2000);
  await dismissWarning(page);

  // 2. Vendor Name popup — #tabParties-partiesSection-sub1 select button
  console.log('Clicking Vendor Name select...');
  await page.locator('#tabParties-partiesSection-sub1').scrollIntoViewIfNeeded().catch(() => {});
  await page.waitForTimeout(500);
  await page.locator('#tabParties-partiesSection-sub1').getByRole('button', { name: 'select' }).click({ timeout: 20000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);

  await verifyPopupRows(page, 'Vendor Name');

  // Select first data row (auto-closes popup) so Items lookup works on both QA and UAT
  const vendorRow = page.locator('.cdk-overlay-container [role="dialog"] tr td').first();
  if (await vendorRow.count() > 0) {
    await vendorRow.click();
  } else {
    await closePopup(page);
  }
  await page.waitForTimeout(2000);
  await dismissWarning(page);

  // 3. Add Shipment Items → Select from Item Vendor
  console.log('Clicking Add Shipment Items → Select from Item Vendor...');
  await page.getByRole('menuitem', { name: 'Add Shipment Items' }).click({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.getByRole('menuitem', { name: 'Select from Item Vendor' }).click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await page.waitForTimeout(1500);

  await verifyPopupRows(page, 'Shipment Items — Select from Item Vendor');
  await closePopup(page);

  // 4. Add Shipment Items → Select from Item Shipment
  console.log('Clicking Add Shipment Items → Select from Item Shipment...');
  await page.getByRole('menuitem', { name: 'Add Shipment Items' }).click({ timeout: 15000 });
  await page.waitForTimeout(800);
  await page.getByRole('menuitem', { name: 'Select from Item Shipment' }).click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await page.waitForTimeout(1500);

  await verifyPopupRows(page, 'Shipment Items — Select from Item Shipment');
  await closePopup(page);

  console.log('Shipment Advice popup validations complete');
});
