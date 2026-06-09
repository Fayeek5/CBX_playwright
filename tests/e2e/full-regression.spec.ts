import { test } from '@playwright/test';

import { runItem } from '../../modules/item';
import { runVendor } from '../../modules/vendor';
import { runFactory } from '../../modules/factory';
import { runForwarder } from '../../modules/forwarder';
import { runCustomer } from '../../modules/customer';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Full business flow', async ({ page }) => {

  await runItem(page);

  await runVendor(page);

  await runFactory(page);

  await runForwarder(page);

  await runCustomer(page);


});
