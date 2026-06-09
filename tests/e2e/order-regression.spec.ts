import { test } from '@playwright/test';

import { runVendorPO } from '../../modules/vendor-po';
import { runShipmentAdvice } from '../../modules/shipment-advice';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Order Regression', async ({ page }) => {
  await runVendorPO(page);

  await runShipmentAdvice(page);
});
