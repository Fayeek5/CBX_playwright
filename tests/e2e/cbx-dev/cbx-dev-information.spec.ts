import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Communications',
  'Documents',
];

for (const subModule of subModules) {
  test(`Information Centre — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Information ${subModule}`);
  });
}
