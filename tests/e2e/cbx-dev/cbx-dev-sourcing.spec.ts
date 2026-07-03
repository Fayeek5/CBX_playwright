import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Request for Information',
  'Quick Quotes',
  'Request for Quotations',
  'Quotations',
  'Estimated Costs',
];

for (const subModule of subModules) {
  test(`Sourcing — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Sourcing ${subModule}`);
  });
}
