import { test } from '@playwright/test';
import { navigateToListing, setDateToLast12Months, openFirstRecord } from './helpers';

test.use({ storageState: 'fixtures/.auth/user.json' });

const subModules = [
  'Items',
  'Specifications',
  'Line Sheets',
  'Projects',
  'Material Palettes',
  'Color Palettes',
  'Print Palettes',
  'Product Artwork Palettes',
];

for (const subModule of subModules) {
  test(`PLM — ${subModule} listing and record open`, async ({ page }) => {
    await navigateToListing(page, subModule);
    await setDateToLast12Months(page);
    await openFirstRecord(page, `PLM ${subModule}`);
  });
}
