import { open } from '../../helpers/navigation';
import { markActive, markInactive } from '../../helpers/markAs';
import { save } from '../../helpers/save';
import { test, expect } from '@playwright/test';
import { closeSidebar } from '../../../helpers/sidebar-helper';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Forwarder Search flow', async ({ page }) => {

  await page.goto('/listing/master/forwarder/forwView');

  const forwarderCode = (
    await page
      .locator('[col-id="forwarderCode"] div.text-wrapper')
      .first()
      .textContent()
  )?.trim();

  expect(forwarderCode).toBeTruthy();

  console.log(
    'Searching Forwarder:',
    forwarderCode
  );

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .evaluate(el => (el as HTMLElement).click());

  await page.waitForLoadState('domcontentloaded');

  await page
    .getByPlaceholder('Filter...')
    .fill(forwarderCode!);

  await page
    .getByPlaceholder('Filter...')
    .press('Enter');

  await expect(
    page
      .getByRole('row', {
        name: new RegExp(forwarderCode!)
      })
      .locator('[col-id="forwarderCode"] div.text-wrapper')
  ).toContainText(forwarderCode!);

  console.log(
    'Forwarder search completed:',
    forwarderCode
  );
});
