import { open } from '../../helpers/navigation';
import { markActive, markInactive } from '../../helpers/markAs';
import { save } from '../../helpers/save';
import { test, expect } from '@playwright/test';
import { closeSidebar } from '../../../helpers/sidebar-helper';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO VPO Search flow', async ({ page }) => {
    await page.goto('/listing/order/vpo/vpoView');

  await page.waitForLoadState('networkidle');

  await page.waitForLoadState('domcontentloaded');

  await expect(
    page.locator('[col-id="vpoNo"]').first()
  ).toBeVisible({
    timeout:30000
  });

  await expect(
    page.locator('div[col-id="vpoNo"] a').first()
).toBeVisible({
    timeout:30000
});

const vpoNo = (
    await page
        .locator('div[col-id="vpoNo"] a')
        .first()
        .innerText()
)?.trim();

  expect(vpoNo).toBeTruthy();

  console.log('Searching VPO:', vpoNo);

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .evaluate(el => (el as HTMLElement).click());

  await page.waitForLoadState('domcontentloaded');

  await page
    .getByPlaceholder('Filter...')
    .fill(vpoNo);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page.getByRole('link', {
      name: vpoNo
    })
  ).toBeVisible();

  console.log(
    'VPO search completed'
  );

});
