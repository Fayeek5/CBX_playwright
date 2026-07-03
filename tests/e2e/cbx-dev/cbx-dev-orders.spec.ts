import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Customer Purchase Orders',
  'Customer Sales Orders',
  'Customer Offer Sheets',
  'Vendor Purchase Orders',
  'Vendor PO Acks',
  'Vendor Master Orders',
  'Shipment Bookings',
  'Shipment Advices',
  'Customer Invoices',
  'Vendor Invoices',
  'Claims',
  'Letters of Credit',
  'Packing Lists',
];

for (const subModule of subModules) {
  test(`Orders & Logistics — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Orders ${subModule}`);
  });
}
