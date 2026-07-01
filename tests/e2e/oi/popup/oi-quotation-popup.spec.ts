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
    document.body.textContent?.includes('Lookup') ||
    (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done'))
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

test('Quotation Amend — Vendor Name and Facility Name popup listing', async ({ page }) => {
  await page.goto('/listing/sourcing/vq/vqView');
  await page.waitForLoadState('domcontentloaded');

  const links = page.locator('[role="row"] a');
  const hasLink = await links.first().waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasLink) {
    throw new Error('No records found in Quotation listing — marking as FAILED');
  }

  const linkCount = await links.count();
  let vendorDone = false;
  let facilityDone = false;

  for (let i = 0; i < Math.min(linkCount, 10); i++) {
    await page.goto('/listing/sourcing/vq/vqView');
    await page.waitForLoadState('domcontentloaded');
    await links.first().waitFor({ state: 'visible', timeout: 30000 });
    await links.nth(i).click();
    await page.waitForURL(/\/document\//, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    console.log(`Checking Quotation [${i}]:`, page.url());

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

    // 1. Vendor Name select popup
    if (!vendorDone) {
      console.log('Clicking Vendor Name select...');
      const vendorClicked = await clickSelectNear(page, 'Vendor Name');
      console.log('Vendor Name select clicked:', vendorClicked);
      if (vendorClicked) {
        await page.waitForTimeout(2000);
        const rowCount = await page.evaluate(() =>
          document.querySelectorAll(
            '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
            'mat-dialog-container tr, table tr, [role="dialog"] tr'
          ).length
        );
        const hasTitle = await page.evaluate(() =>
          document.body.textContent?.includes('Lookup') ||
          (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done'))
        );
        console.log(`Vendor Name popup — rows found: ${rowCount}, popup title: ${hasTitle}`);
        if (rowCount > 0 || hasTitle) {
          expect(rowCount > 0 || hasTitle).toBeTruthy();
          console.log('Vendor Name popup verified ✓');
          vendorDone = true;
          await page.keyboard.press('Escape');
          await page.waitForTimeout(2000);
        }
      }
    }

    // 2. Facility Name select popup — "Factory Name" on UAT, "Facility Name" on QA
    if (!facilityDone) {
      console.log('Clicking Facility Name select...');
      let facilityClicked = false;
      for (const label of ['Factory Name', 'Facility Name', 'Facility', 'Factory']) {
        facilityClicked = await clickSelectNear(page, label);
        if (facilityClicked) { console.log(`Facility clicked via label: "${label}"`); break; }
      }
      if (!facilityClicked) {
        await page.waitForTimeout(1500);
        for (const label of ['Factory Name', 'Facility Name', 'Facility', 'Factory']) {
          facilityClicked = await clickSelectNear(page, label);
          if (facilityClicked) { console.log(`Facility clicked on retry via label: "${label}"`); break; }
        }
      }
      console.log('Facility Name select clicked:', facilityClicked);
      if (facilityClicked) {
        await page.waitForTimeout(2000);
        const rowCount = await page.evaluate(() =>
          document.querySelectorAll(
            '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
            'mat-dialog-container tr, table tr, [role="dialog"] tr'
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
        }
      }
    }

    if (vendorDone && facilityDone) break;
  }

  if (!vendorDone) throw new Error('Vendor Name popup could not be verified on any record — marking as FAILED');
  if (!facilityDone) throw new Error('Facility Name popup could not be verified on any record — marking as FAILED');

  console.log('Quotation popup validations complete');
});
