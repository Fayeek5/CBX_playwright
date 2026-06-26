import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openInspectionBookings(page: Page) {
  await page.goto('/listing/quality/inspectBooking/inspectBookingView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('Inspection Booking Search flow', async ({ page }) => {

  await openInspectionBookings(page);

  const bookingNo = (
    await page
      .locator('[col-id="inspectBookingNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(bookingNo).toBeTruthy();

  console.log('Searching Booking No:', bookingNo);

  try {
    await page.locator('app-header-cell').filter({ hasText: 'Booking No.' }).locator('.filter-button button').click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page
    .getByPlaceholder('Filter...')
    .fill(bookingNo!);

  await page
    .getByRole('button', { name: 'Apply' })
    .click();

  await expect(
    page.locator('[col-id="inspectBookingNo"] a').first()
  ).toContainText(bookingNo!);

  console.log('Search verified:', bookingNo);

  await page
    .locator('[col-id="inspectBookingNo"] a')
    .first()
    .click();

  await page.waitForURL('**/document/quality/inspectBooking/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Inspection Booking search completed:', bookingNo);
  console.log('Opened URL:', page.url());
});
