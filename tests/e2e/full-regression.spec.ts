import { test } from '@playwright/test';

import { runItem } from '../../modules/item';
import { runVendor } from '../../modules/vendor';
import { runFactory } from '../../modules/factory';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Full business flow', async ({ page }) => {

  await runItem(page);

  await runVendor(page);

  await runFactory(page);

});
