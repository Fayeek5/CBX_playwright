import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Customers',
  'Vendors',
  'Facilities',
  'Service Providers',
  'Forwarders',
];

for (const subModule of subModules) {
  test(`Partners — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Partners ${subModule}`);
  });
}
