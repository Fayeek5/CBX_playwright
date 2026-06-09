import { test } from '@playwright/test';

import { runVendorPO } from '../../modules/vendor-po';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Order Regression', async ({ page }) => {
  await runVendorPO(page);
});
