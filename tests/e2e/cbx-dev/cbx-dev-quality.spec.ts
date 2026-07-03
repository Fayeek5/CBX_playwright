import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Sample Requests',
  'Sample Trackers',
  'Sample Evaluations',
  'Inspection Bookings',
  'Inspection Reports',
  'CAPA Plan',
  'Quality Checklists',
  'Inspection Checklists',
  'Audits',
  'Test Accreditation',
];

for (const subModule of subModules) {
  test(`Quality & Compliance — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `Quality ${subModule}`);
  });
}
