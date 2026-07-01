import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function clickSelectNear(page: any, labelText: string): Promise<boolean> {
  return page.evaluate((label: string) => {
    const allEls = Array.from(document.querySelectorAll('label, span, td, th, div, p'));
    const labelEl = allEls.find(e =>
      e.textContent?.trim().toLowerCase().includes(label.toLowerCase()) &&
      (e as HTMLElement).offsetParent !== null &&
      !e.querySelector('button, input, a')
    );
    if (!labelEl) return false;

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

async function dismissAnyDialog(page: any): Promise<boolean> {
  const dismissed = await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button'))
      .find(b => ['OK', 'yes', 'Yes'].includes(b.textContent?.trim() ?? '') && (b as HTMLElement).offsetParent !== null);
    if (btn) { (btn as HTMLElement).click(); return true; }
    return false;
  });
  if (dismissed) await page.waitForTimeout(800);
  return dismissed;
}

async function verifyPopupRows(page: any, fieldName: string) {
  await page.waitForTimeout(2000);

  const rowCount = await page.evaluate(() => {
    return document.querySelectorAll(
      '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
      'mat-dialog-container tr, mat-dialog-container [role="row"], ' +
      'table tr, [role="dialog"] tr, [role="dialog"] [role="row"]'
    ).length;
  });

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

  const links = page.locator('[col-id="inspectBookingNo"] a');
  const hasLink = await links.first().waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasLink) {
    throw new Error('No records found in Inspection Booking listing — marking as FAILED');
  }

  const linkCount = await links.count();
  let inspectorDone = false;
  let facilityDone = false;

  for (let i = 0; i < Math.min(linkCount, 20); i++) {
    await page.goto('/listing/quality/inspectBooking/inspectBookingView');
    await page.waitForLoadState('domcontentloaded');
    await links.first().waitFor({ state: 'visible', timeout: 30000 });
    await links.nth(i).click();
    await page.waitForURL(/\/document\/quality\/inspectBooking\//, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    console.log(`Checking record [${i}]:`, page.url());

    // Amend
    const amended = await page.evaluate(() => {
      const el = Array.from(document.querySelectorAll('a, button, li, span'))
        .find(e => e.textContent?.trim() === 'Amend' && (e as HTMLElement).offsetParent !== null);
      if (el) { (el as HTMLElement).click(); return true; }
      return false;
    });
    if (!amended) { console.log('No Amend on this record, skipping'); continue; }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    console.log('Amend mode activated');

    // 1. Inspector(s) popup — only need to do once
    if (!inspectorDone) {
      const inspectorClicked = await clickSelectNear(page, 'Inspector');
      console.log('Inspector select clicked:', inspectorClicked);
      if (inspectorClicked) {
        await dismissAnyDialog(page);
        const rowCount = await page.evaluate(() =>
          document.querySelectorAll(
            '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
            'mat-dialog-container tr, table tr, [role="dialog"] tr'
          ).length
        );
        const hasTitle = await page.evaluate(() => document.body.textContent?.includes('Lookup'));
        console.log(`Inspector(s) popup — rows found: ${rowCount}, popup title: ${hasTitle}`);
        if (rowCount > 0 || hasTitle) {
          expect(rowCount > 0 || hasTitle).toBeTruthy();
          console.log('Inspector(s) popup verified ✓');
          inspectorDone = true;
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        }
      }
    }

    // 2. Navigate to Parties → Facility Name popup
    if (!facilityDone) {
      await page.evaluate(() => {
        const el = Array.from(document.querySelectorAll('a, button, li, span'))
          .find(e => e.textContent?.trim() === 'Parties' && (e as HTMLElement).offsetParent !== null);
        (el as HTMLElement)?.click();
      });
      await page.waitForTimeout(2000);
      await dismissAnyDialog(page);

      // Try component-scoped selector first (QA uses app-inspect-booking-party-edit)
      let facilityClicked = await page.evaluate(() => {
        const partyEdit = document.querySelector('app-inspect-booking-party-edit');
        if (partyEdit) {
          const btn = Array.from(partyEdit.querySelectorAll('button'))
            .find(b => /select/i.test(b.textContent?.trim() ?? '') && (b as HTMLElement).offsetParent !== null);
          if (btn) { (btn as HTMLElement).click(); return true; }
        }
        return false;
      });
      if (facilityClicked) {
        console.log('Facility clicked via app-inspect-booking-party-edit');
      } else {
        for (const label of ['Facility Name', 'Location', 'Facility']) {
          facilityClicked = await clickSelectNear(page, label);
          if (facilityClicked) { console.log(`Facility clicked via label: "${label}"`); break; }
        }
      }
      console.log('Facility select clicked:', facilityClicked);

      if (facilityClicked) {
        // Business rule warning appears on QA ("selected lbl.fact already has Shipment Item(s)")
        // Dismiss it, then check if popup opened — on QA it does NOT open (data issue)
        await page.waitForTimeout(1500);
        await dismissAnyDialog(page);
        await page.waitForTimeout(2000);

        const rowCount = await page.evaluate(() =>
          document.querySelectorAll(
            '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
            '.cdk-overlay-container [role="option"], .cdk-overlay-container mat-option, ' +
            '.cdk-overlay-container [role="listitem"], ' +
            'mat-dialog-container tr, [role="dialog"] tr, [role="dialog"] [role="row"]'
          ).length
        );
        const hasTitle = await page.evaluate(() =>
          document.body.textContent?.includes('Lookup') ||
          (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done'))
        );
        console.log(`Facility Name popup — rows found: ${rowCount}, popup title: ${hasTitle}`);

        if (rowCount > 0 || hasTitle) {
          expect(rowCount > 0 || hasTitle).toBeTruthy();
          console.log('Facility Name popup verified ✓');
          facilityDone = true;
          await page.keyboard.press('Escape');
          await page.waitForTimeout(1000);
        } else {
          console.log('Facility popup did not open — cancelling amend on this record');
          await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button'))
              .find(b => b.textContent?.trim() === 'Cancel' && (b as HTMLElement).offsetParent !== null);
            if (btn) (btn as HTMLElement).click();
          });
          await page.waitForTimeout(1000);
          await dismissAnyDialog(page);
        }
      }
    }

    if (inspectorDone && facilityDone) break;
  }

  if (!inspectorDone) throw new Error('Inspector(s) popup could not be verified on any record — marking as FAILED');
  if (!facilityDone) throw new Error('Facility Name popup could not be verified on any record — marking as FAILED');

  console.log('Inspection Booking popup validations complete');
});
