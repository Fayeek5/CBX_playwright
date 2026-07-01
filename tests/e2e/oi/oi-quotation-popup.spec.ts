import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openPopupNearLabel(page: any, labelText: string): Promise<boolean> {
  // Find the select/lookup button nearest to a label containing labelText
  const clicked = await page.evaluate((label: string) => {
    const labels = Array.from(document.querySelectorAll('label, .field-label, [class*="label"], th, td'))
      .filter(el => el.textContent?.trim().toLowerCase().includes(label.toLowerCase()));
    for (const lbl of labels) {
      const container = lbl.closest('tr, .field-row, .form-group, [class*="field"], div') ?? lbl.parentElement;
      if (!container) continue;
      const btn = container.querySelector('button') as HTMLButtonElement | null;
      if (btn) { btn.click(); return true; }
    }
    return false;
  }, labelText);
  return clicked;
}

async function verifyPopup(page: any, fieldName: string) {
  const popup = page.locator('mat-dialog-container, [class*="modal-content"], [class*="popup-content"]').first();
  const visible = await popup.waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!visible) {
    throw new Error(`${fieldName} popup did not open — marking as FAILED`);
  }
  const rows = await popup.locator('[role="row"], tr').count();
  console.log(`${fieldName} popup opened — rows: ${rows}`);
  expect(rows).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);
}

test('Quotation Amend — Vendor Name and Facility Name popup listing', async ({ page }) => {
  await page.goto('/listing/order/quotation/quotationView');
  await page.waitForLoadState('domcontentloaded');

  const firstLink = page.locator('[role="row"] a').first();
  const hasLink = await firstLink.waitFor({ state: 'visible', timeout: 30000 }).then(() => true).catch(() => false);
  if (!hasLink) {
    throw new Error('No records found in Quotation listing — marking as FAILED');
  }

  await firstLink.click();
  await page.waitForURL(/\/document\//, { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);
  console.log('Opened Quotation:', page.url());

  // Amend
  const amendBtn = page.getByRole('button', { name: /^Amend$/i }).first();
  const hasAmend = await amendBtn.waitFor({ state: 'visible', timeout: 15000 }).then(() => true).catch(() => false);
  if (!hasAmend) {
    throw new Error('Amend button not found — marking as FAILED');
  }
  await amendBtn.click();
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  console.log('Amend mode activated');

  // 1. Vendor Name popup
  await openPopupNearLabel(page, 'Vendor Name');
  await page.waitForTimeout(1000);
  await verifyPopup(page, 'Vendor Name');

  // 2. Facility Name popup
  await openPopupNearLabel(page, 'Facility');
  await page.waitForTimeout(1000);
  await verifyPopup(page, 'Facility Name');

  console.log('Quotation popup validations complete');
});
