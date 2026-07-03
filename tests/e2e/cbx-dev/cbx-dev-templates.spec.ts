import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Product Related',
  'Sample Related',
  'Cost Related',
  'Quality & Compliance Related',
  'Others',
  'Test Method',
  'Test Protocol Templates',
];

for (const subModule of subModules) {
  test(`Templates — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Templates ${subModule}`);
  });
}
