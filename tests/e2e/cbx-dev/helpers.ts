import { Page } from '@playwright/test';

async function waitForSidebar(page: Page): Promise<void> {
  // Wait until all sidebar icon buttons are rendered (CBX dev has 14)
  await page.waitForFunction(
    () => document.querySelectorAll('button.tab-icon-button').length >= 10,
    { timeout: 20000 }
  );
  await page.waitForTimeout(500);
}

export async function navigateToListing(page: Page, subModuleName: string): Promise<void> {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');
  await waitForSidebar(page);
  const homeUrl = page.url();

  // Keywords from sub-module name used to match the destination URL path
  const nameWords = subModuleName.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const sidebarBtns = page.locator('button.tab-icon-button');
  const count = await sidebarBtns.count();

  let found = false;
  for (let i = 0; i < count; i++) {
    const btn = page.locator('button.tab-icon-button').nth(i);

    // Skip the Search button — detected by its Material icon text content
    const btnText = (await btn.textContent().catch(() => '')).trim().toLowerCase();
    if (btnText === 'search') continue;

    await btn.click().catch(() => {});
    await page.waitForTimeout(800);

    const currentUrl = page.url();

    // Case 1: button navigated directly to a listing (single-submodule modules like CPM)
    if (currentUrl !== homeUrl) {
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      const urlPath = new URL(currentUrl).pathname.toLowerCase();
      const matchCount = nameWords.filter(w => urlPath.includes(w)).length;
      if (matchCount >= Math.ceil(nameWords.length / 2)) {
        found = true;
        break;
      }
      // Wrong destination — return home and wait for sidebar to re-render
      await page.goto(homeUrl);
      await page.waitForLoadState('domcontentloaded');
      await waitForSidebar(page);
      continue;
    }

    // Case 2: flyout appeared on home — read href from visible link and navigate directly
    // (avoids leaving the sidenav flyout open, which blocks subsequent interactions)
    const link = page.getByRole('link').filter({ hasText: subModuleName });
    if (await link.count() > 0 && await link.first().isVisible().catch(() => false)) {
      const href = await link.first().getAttribute('href').catch(() => null);
      if (href) {
        found = true;
        await page.goto(href);
      }
      break;
    }
  }

  if (!found) throw new Error(`"${subModuleName}" link not found in sidebar — marking as FAILED`);
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(3000);

  console.log(`${subModuleName} listing URL: ${page.url()}`);
}

export async function setDateToLast12Months(page: Page): Promise<void> {
  const trigger = page.getByRole('button', { name: /any.?time/i }).first();
  if (await trigger.count() === 0) return;
  // Use dispatchEvent to bypass any sidenav overlay that intercepts pointer events
  await trigger.dispatchEvent('click');
  await page.waitForTimeout(500);
  const option = page
    .locator('.cdk-overlay-container, mat-option, [role="option"], [role="listbox"]')
    .getByText(/^last 12 months$/i)
    .first();
  if (await option.count() > 0) {
    await option.click();
  } else {
    await page.getByText(/last 12 months/i).first().click().catch(() => {});
  }
  await page.waitForTimeout(2000);
}

export async function openFirstRecord(page: Page, label: string): Promise<void> {
  const firstLink = page.locator('.ag-row a').first();
  await firstLink.waitFor({ state: 'visible', timeout: 30000 }).catch(() => {});
  if (await firstLink.count() === 0) {
    console.log(`${label}: No records visible — skipping record open`);
    return;
  }
  const href = await firstLink.getAttribute('href');
  console.log(`${label} — opening record: ${href}`);
  await firstLink.click();
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(3000);
  console.log(`${label} record URL: ${page.url()}`);
}
