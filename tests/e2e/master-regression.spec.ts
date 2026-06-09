import { test } from '@playwright/test';

import { runItem } from '../../modules/item';
import { runVendor } from '../../modules/vendor';
import { runFactory } from '../../modules/factory';
import { runForwarder } from '../../modules/forwarder';
import { runCustomer } from '../../modules/customer';
import { runFactoryAudit } from '../../modules/factory-audit';
import { runVendorPO } from '../../modules/vendor-po';
import { runInspectionBooking } from '../../modules/inspection-booking';


test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Master Regression', async ({ page }) => {
  await runItem(page);
  await runVendor(page);
  await runFactory(page);
  await runForwarder(page);
  await runCustomer(page);

  await runFactoryAudit(page);

  await runVendorPO(page);

  await runInspectionBooking(page);
});
