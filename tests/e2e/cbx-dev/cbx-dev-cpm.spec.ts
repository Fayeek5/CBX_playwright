import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

test('CPM — Activities listing and record open', async ({ page }) => {
  await navigateToListing(page, 'Activities');
  await setDateToLast12Months(page);
  await openFirstRecord(page, 'CPM Activities');
});
