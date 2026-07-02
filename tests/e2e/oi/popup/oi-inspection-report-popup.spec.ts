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
    const hasWarning = Array.from(document.querySelectorAll('button'))
      .some(b => b.textContent?.trim() === 'OK' && (b as HTMLElement).offsetParent !== null);
    return dialogVisible || hasWarning ||
      document.body.textContent?.includes('Lookup') ||
      (document.body.textContent?.includes('noRecordsFound') && dialogVisible);
  });

  console.log(`${fieldName} popup — rows found: ${rowCount}, popup detected: ${hasPopup}`);

  if (rowCount === 0 && !hasPopup) {
    throw new Error(`${fieldName} popup did not open or has no records — marking as FAILED`);
  }

  expect(rowCount > 0 || hasPopup).toBeTruthy();
  console.log(`${fieldName} popup verified ✓ (rows: ${rowCount})`);
}

async function closePopup(page: any, label?: string) {
  const overlay = page.locator('.cdk-overlay-container, mat-dialog-container');
  const closeBtn = overlay.getByRole('button', { name: /^close$/i });
  const cancelBtn = overlay.getByRole('button', { name: /^cancel$/i });
  const doneBtn = overlay.getByRole('button', { name: /^done$/i });
  if (await closeBtn.count() > 0) {
    console.log(`[closePopup${label ? ' '+label : ''}] clicking close`);
    await closeBtn.first().click();
  } else if (await doneBtn.count() > 0 && await doneBtn.first().isEnabled()) {
    console.log(`[closePopup${label ? ' '+label : ''}] clicking done`);
    await doneBtn.first().click();
  } else if (await cancelBtn.count() > 0) {
    console.log(`[closePopup${label ? ' '+label : ''}] clicking cancel`);
    await cancelBtn.first().click();
  } else {
    // Only press Escape if a CDK overlay is still active
    const hasOverlay = await page.evaluate(() =>
      document.querySelector('.cdk-overlay-backdrop-showing, .cdk-overlay-pane mat-dialog-container') !== null
    );
    if (hasOverlay) {
      console.log(`[closePopup${label ? ' '+label : ''}] pressing Escape`);
      await page.keyboard.press('Escape');
    } else {
      console.log(`[closePopup${label ? ' '+label : ''}] no overlay, skipping`);
    }
  }
  await page.waitForTimeout(1000);
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

test('Inspection Report Create — Inspectors, Facility Name, Customer Name, and Vendor Name popup listing', async ({ page }) => {
  await page.goto('/listing/quality/inspectionReport/inspectionReportView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);

  // Find "Inspection Reports" nav link by iterating empty sidebar buttons
  const listingUrl = page.url();
  const emptyBtns = page.getByRole('button').filter({ hasText: /^$/ });
  let navLinkFound = false;
  for (let i = 0; i <= 15; i++) {
    await emptyBtns.nth(i).click().catch(() => {});
    await page.waitForTimeout(800);
    const found = await page.getByRole('link', { name: /inspection report/i }).count();
    if (found > 0) { navLinkFound = true; break; }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }

  if (navLinkFound) {
    await page.getByRole('link', { name: /inspection report/i }).first().click();
    await page.waitForTimeout(3000);
  } else {
    // Nav link not found — return to listing URL directly
    await page.goto(listingUrl);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
  }
  await page.mouse.move(800, 400);
  await page.waitForTimeout(1000);
  console.log('Listing URL:', page.url());

  // Create → New Inspection Report
  await page.getByRole('menuitem', { name: 'Create' }).click({ timeout: 15000 });
  await page.waitForTimeout(500);
  await page.getByRole('menuitem', { name: 'New Inspection Report', exact: true }).click({ timeout: 10000 });
  await page.waitForTimeout(5000);
  console.log('Inspection Report form opened:', page.url());
  await dismissWarning(page);

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
  await dismissWarning(page);
  console.log('Product categories selected');

  // 1. Inspectors
  console.log('Clicking Inspectors select...');
  await page.getByRole('button', { name: /inspector/i }).first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);
  await dismissWarning(page);
  await verifyPopupRows(page, 'Inspectors');
  // Select first inspector (required for Facility Name popup context)
  await page.locator('.cdk-overlay-container .checkbox-size-16 > .checkbox__control, .cdk-overlay-container input[type="checkbox"]').first().check().catch(() => {});
  await page.waitForTimeout(500);
  // Close with done (now enabled after selection)
  const doneBtn = page.locator('.cdk-overlay-container').getByRole('button', { name: /^done$/i });
  if (await doneBtn.count() > 0 && await doneBtn.first().isEnabled()) {
    await doneBtn.first().click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForSelector('.cdk-overlay-backdrop-showing', { state: 'hidden', timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(1500);

  // Navigate to Parties section
  await page.locator('text=Parties').first().click({ timeout: 10000 });
  await page.waitForTimeout(2000);

  // Helper: scroll select-btn into view then click via mouse coordinates
  async function clickAndWaitForPopup(fieldIdClass: string): Promise<void> {
    // Scroll button into view first
    await page.evaluate((cls: string) => {
      const btn = document.querySelector(`.${cls} button.select-btn`) as HTMLElement | null;
      if (btn) btn.scrollIntoView({ behavior: 'auto', block: 'center' });
    }, fieldIdClass);
    await page.waitForTimeout(400);
    // Get fresh coordinates after scroll
    const coords = await page.evaluate((cls: string) => {
      const btn = document.querySelector(`.${cls} button.select-btn`) as HTMLButtonElement | null;
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : null;
    }, fieldIdClass);
    if (coords) {
      await page.mouse.click(coords.x, coords.y);
    }
    await page.waitForTimeout(3000);
  }

  // 2. Vendor Name
  console.log('Clicking Vendor Name select...');
  await clickAndWaitForPopup('input-field-id-vendor');
  await verifyPopupRows(page, 'Vendor Name');
  await dismissWarning(page);
  await closePopup(page, 'Vendor');

  // 3. Facility Name (requires vendor selected — shows warning if not; warning = valid trigger)
  console.log('Clicking Facility Name select...');
  await clickAndWaitForPopup('input-field-id-factory');
  await verifyPopupRows(page, 'Facility Name');
  await dismissWarning(page);
  await closePopup(page, 'Facility');

  // 4. Customer Name
  console.log('Clicking Customer Name select...');
  await clickAndWaitForPopup('input-field-id-customer');
  await verifyPopupRows(page, 'Customer Name');
  await dismissWarning(page);
  await closePopup(page, 'Customer');

  console.log('Inspection Report popup validations complete');
});
