import { test } from '@playwright/test';

import { runFactoryAudit } from '../../modules/factory-audit';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Quality Regression', async ({ page }) => {
  await runFactoryAudit(page);
});
