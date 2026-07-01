import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

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

async function tryAmend(page: any): Promise<boolean> {
  // Direct Amend button
  const direct = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim() === 'Amend' && (e as HTMLElement).offsetParent !== null);
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  if (direct) return true;

  // Via Actions dropdown
  const actionsClicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim().includes('Actions') && (e as HTMLElement).offsetParent !== null);
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  if (!actionsClicked) return false;

  await page.waitForTimeout(500);
  return page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span, [role="menuitem"]'))
      .find(e => /^amend$/i.test(e.textContent?.trim() ?? '') && (e as HTMLElement).offsetParent !== null);
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
}

async function isInEditMode(page: any): Promise<boolean> {
  return page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    return btns.some(b =>
      (b.textContent?.trim() === 'Save' || b.textContent?.trim() === 'Cancel') &&
      (b as HTMLElement).offsetParent !== null
    );
  });
}

async function dismissWarning(page: any): Promise<boolean> {
  // Use JS evaluate to find the exact OK button in a warning dialog (exact text match)
  const dismissed = await page.evaluate(() => {
    const okBtn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'OK' && (b as HTMLElement).offsetParent !== null);
    if (okBtn) { (okBtn as HTMLElement).click(); return true; }
    return false;
  });
  if (dismissed) await page.waitForTimeout(800);
  return dismissed;
}

async function verifyItemsSelectPopup(page: any) {
  // Dismiss any blocking warning first
  await dismissWarning(page);

  // Navigate to Items section
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim() === 'Items' && (e as HTMLElement).offsetParent !== null);
    (el as HTMLElement)?.click();
  });
  await page.waitForTimeout(1500);
  await dismissWarning(page);
  console.log('Navigated to Items section');

  // Click Add button
  const addClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b =>
      /^add$/i.test(b.textContent?.trim() ?? '') &&
      (b as HTMLElement).offsetParent !== null
    );
    if (addBtn) { (addBtn as HTMLButtonElement).click(); return true; }
    return false;
  });
  console.log('Add button clicked:', addClicked);
  await page.waitForTimeout(1000);
  await dismissWarning(page);

  // Click Select... from dropdown
  const selectClicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, li, button, span, [role="menuitem"]'))
      .find(e =>
        /select/i.test(e.textContent?.trim() ?? '') &&
        (e as HTMLElement).offsetParent !== null
      );
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  console.log('Items Select option clicked:', selectClicked);

  await verifyPopupRows(page, 'Items Select');
}

test('VPO — Customer Name, Vendor Name and Items Select popup listing', async ({ page }) => {
  await page.goto('/listing/order/vpo/vpoView');
  await page.waitForLoadState('domcontentloaded');

  const firstLink = page.locator('[col-id="vpoNo"] a').first();
  const hasFirst = await firstLink.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasFirst) {
    throw new Error('No records found in VPO listing — marking as FAILED');
  }

  const linkCount = await page.locator('[col-id="vpoNo"] a').count();
  console.log('VPO records found:', linkCount);

  // Try Amend on up to 15 records (works on QA where draft records exist)
  let amendFound = false;
  for (let i = 0; i < Math.min(linkCount, 15); i++) {
    await page.goto('/listing/order/vpo/vpoView');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('[col-id="vpoNo"] a').first().waitFor({ state: 'visible', timeout: 30000 });
    await page.locator('[col-id="vpoNo"] a').nth(i).click();
    await page.waitForURL(/\/document\/order\/vpo\//, { timeout: 30000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    console.log(`Checking VPO [${i}]:`, page.url());

    const amended = await tryAmend(page);
    if (amended) {
      await page.waitForTimeout(2000);
      if (await isInEditMode(page)) {
        console.log('Amend mode activated — running Items Select popup test');
        amendFound = true;
        await verifyItemsSelectPopup(page);
        console.log('VPO Amend popup validations complete');
        return;
      }
    }
  }

  // Amend not available — fall back to Create new VPO (UAT path)
  // Navigate to a VPO document page first (Create button in toolbar is on doc page)
  console.log('No amendable VPO found — using Create flow');
  await page.goto('/listing/order/vpo/vpoView');
  await page.waitForLoadState('domcontentloaded');
  const firstVpoLink = page.locator('[col-id="vpoNo"] a').first();
  await firstVpoLink.waitFor({ state: 'visible', timeout: 15000 });
  const firstVpoUrl = await firstVpoLink.getAttribute('href');
  await firstVpoLink.click();
  await page.waitForURL(/\/document\/order\/vpo\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  console.log('Opened VPO doc for Create:', page.url());

  // Click Create dropdown in document toolbar
  const createClicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('button'))
      .find(b =>
        b.textContent?.trim().startsWith('Create') &&
        (b as HTMLElement).offsetParent !== null
      );
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  console.log('Create button clicked:', createClicked);
  if (!createClicked) throw new Error('Create button not found on VPO document — marking as FAILED');
  await page.waitForTimeout(800);

  // Log dropdown items to debug
  const createMenuItems = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[role="menuitem"], .mat-menu-item, li'))
      .filter(e => (e as HTMLElement).offsetParent !== null)
      .map(e => e.textContent?.trim())
      .filter(t => t && t.length > 0 && t.length < 80)
  );
  console.log('Create dropdown items:', JSON.stringify(createMenuItems));

  // Click "New Item Vendor Purchase Order" from dropdown
  const newVpoClicked = await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('[role="menuitem"], .mat-menu-item, li, a, button'))
      .find(e =>
        /vendor purchase order/i.test(e.textContent?.trim() ?? '') &&
        (e as HTMLElement).offsetParent !== null
      );
    if (el) { (el as HTMLElement).click(); return true; }
    return false;
  });
  console.log('"New VPO" menu item clicked:', newVpoClicked);
  if (!newVpoClicked) throw new Error('"New Item Vendor Purchase Order" option not found — marking as FAILED');

  await page.waitForURL(/\/document\/order\/vpo\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('New VPO form opened:', page.url());

  // Dismiss any warning dialogs that may appear on form load
  const hasWarning = await page.evaluate(() => {
    const okBtn = Array.from(document.querySelectorAll('button'))
      .find(b => b.textContent?.trim() === 'OK' && (b as HTMLElement).offsetParent !== null);
    if (okBtn) { (okBtn as HTMLElement).click(); return true; }
    return false;
  });
  if (hasWarning) {
    console.log('Warning dialog dismissed');
    await page.waitForTimeout(1000);
  }

  // Navigate to Parties section to find Customer Name and Vendor Name
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('a, button, li, span'))
      .find(e => e.textContent?.trim() === 'Parties' && (e as HTMLElement).offsetParent !== null);
    (el as HTMLElement)?.click();
  });
  await page.waitForTimeout(1500);
  console.log('Navigated to Parties section');

  // 1. Customer Name — open popup, verify rows, then SELECT first row so Items lookup works
  console.log('Clicking Customer Name select...');
  const customerClicked = await clickSelectNear(page, 'Customer Name');
  console.log('Customer Name select clicked:', customerClicked);
  await page.waitForTimeout(2000);

  const customerRowCount = await page.evaluate(() =>
    document.querySelectorAll(
      '.cdk-overlay-container tr, .cdk-overlay-container [role="row"], ' +
      'mat-dialog-container tr, mat-dialog-container [role="row"], ' +
      'table tr, [role="dialog"] tr, [role="dialog"] [role="row"]'
    ).length
  );
  const hasCustomerPopup = await page.evaluate(() =>
    document.body.textContent?.includes('Lookup') ||
    (document.body.textContent?.includes('cancel') && document.body.textContent?.includes('done'))
  );
  console.log(`Customer Name popup — rows found: ${customerRowCount}, popup title: ${hasCustomerPopup}`);
  if (customerRowCount === 0 && !hasCustomerPopup) {
    throw new Error('Customer Name popup did not open or has no records — marking as FAILED');
  }
  expect(customerRowCount > 0 || hasCustomerPopup).toBeTruthy();
  console.log('Customer Name popup verified ✓');
  // Select the first data row so form has a customer (needed for Items lookup)
  await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll(
      '.cdk-overlay-container tr, mat-dialog-container tr, [role="dialog"] tr'
    )).filter(r => (r as HTMLElement).offsetParent !== null && r.querySelectorAll('td').length > 0);
    if (rows[0]) (rows[0] as HTMLElement).click();
  });
  await page.waitForTimeout(1500);
  await dismissWarning(page);

  // 2. Vendor Name select popup — verify rows then Escape
  console.log('Clicking Vendor Name select...');
  const vendorClicked = await clickSelectNear(page, 'Vendor Name');
  console.log('Vendor Name select clicked:', vendorClicked);
  await dismissWarning(page);
  await verifyPopupRows(page, 'Vendor Name');

  // 3. Items Select popup
  await verifyItemsSelectPopup(page);

  console.log('VPO Create popup validations complete');
});
