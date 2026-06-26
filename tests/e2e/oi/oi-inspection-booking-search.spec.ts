import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openInspectionBookings(page: Page) {
  await page.goto('/home');
  await page.waitForURL('**/home**', { timeout: 30000 });

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

  const link = page.getByRole('link', { name: 'Inspection Bookings' });
  await link.waitFor({ state: 'visible', timeout: 15000 });
  await link.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('ASO Inspection Booking Search flow', async ({ page }) => {

  await openInspectionBookings(page);

  const bookingNo = (
    await page
      .locator('[col-id="inspectBookingNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(bookingNo).toBeTruthy();

  console.log('Searching Booking No:', bookingNo);

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

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
