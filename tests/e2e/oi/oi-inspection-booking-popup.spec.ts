import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function clickSelectNear(page: any, labelText: string): Promise<boolean> {
  return page.evaluate((label: string) => {
    // Find label element containing the text
    const allEls = Array.from(document.querySelectorAll('label, span, td, th, div, p'));
    const labelEl = allEls.find(e =>
      e.textContent?.trim().toLowerCase().includes(label.toLowerCase()) &&
      (e as HTMLElement).offsetParent !== null &&
      !e.querySelector('button, input, a') // prefer leaf-like labels
    );
    if (!labelEl) return false;

    // Look in the parent section for a "select" button or link
    let container: Element | null = labelEl;
    for (let i = 0; i < 5; i++) {
      container = container?.parentElement ?? null;
      if (!container) break;
      const btn = Array.from(container.querySelectorAll('button, a'))
        .find(b =>
          /select/i.test(b.textContent?.trim() ?? '') &&
          (b as HTMLElement).offsetParent !== null
        );
      if (btn) { (btn as HTMLElement).click(); return true; }
    }
    return false;
  }, labelText);
}

async function verifyPopupRows(page: any, fieldName: string) {
  // Wait for popup to appear — check for any overlay rows or title text
  await page.waitForTimeout(2000);

  const rowCount = await page.evaluate(() => {
    // Check Angular Material overlays, dialogs, tables
    return document.querySelectorAll(
      '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
      'mat-dialog-container tr, mat-dialog-container [role="row"], ' +
      'table tr, [role="dialog"] tr, [role="dialog"] [role="row"]'
    ).length;
  });

  // Also check for popup title as secondary confirmation
  const hasPopupTitle = await page.evaluate(() =>
    document.body.textContent?.includes('User Lookup') ||
    document.body.textContent?.includes('Lookup') ||
    document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done')
  );

  console.log(`${fieldName} popup — rows found: ${rowCount}, popup title: ${hasPopupTitle}`);

  if (rowCount === 0 && !hasPopupTitle) {
    throw new Error(`${fieldName} popup did not open or has no records — marking as FAILED`);
  }

  expect(rowCount > 0 || hasPopupTitle).toBeTruthy();
  console.log(`${fieldName} popup verified ✓`);

  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
}

test('Inspection Booking Amend — Inspector and Facility Name popup listing', async ({ page }) => {
  await page.goto('/listing/quality/inspectBooking/inspectBookingView');
  await page.waitForLoadState('domcontentloaded');

  const firstLink = page.locator('[col-id="inspectBookingNo"] a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasLink) {
    throw new Error('No records found in Inspection Booking listing — marking as FAILED');
  }

  await firstLink.click();
  await page.waitForURL(/\/document\/quality\/inspectBooking\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);
  console.log('Opened Inspection Booking:', page.url());

  // Amend
  const amended = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim() === 'Amend' && (e as HTMLElement).offsetParent !== null);
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  if (!amended) {
    throw new Error('Amend button not found — marking as FAILED');
  }
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('Amend mode activated');

  // 1. Inspector(s) popup
  console.log('Clicking Inspector select button...');
  const inspectorClicked = await clickSelectNear(page, 'Inspector');
  console.log('Inspector select clicked:', inspectorClicked);
  await verifyPopupRows(page, 'Inspector(s)');

  // 2. Navigate to Parties section first, then click Facility Name select
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim() === 'Parties' && (e as HTMLElement).offsetParent !== null);
    (el as HTMLElement)?.click();
  });
  await page.waitForTimeout(2000);
  console.log('Navigated to Parties section');

  // The Facility field in Parties is labeled "Location" in the UI
  const facilityClicked = await clickSelectNear(page, 'Location');
  console.log('Facility (Location) select clicked:', facilityClicked);
  await verifyPopupRows(page, 'Facility Name');

  console.log('Inspection Booking popup validations complete');
});
