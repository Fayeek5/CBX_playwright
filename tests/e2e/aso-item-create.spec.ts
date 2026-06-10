import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item - Create using Copy', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  const sourceItem = (
    await page
      .locator('[col-id="itemNo"] a')
      .first()
      .textContent()
  )?.trim();

  console.log('Source Item:', sourceItem);

  await page
    .locator('[col-id="itemNo"] a')
    .first()
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Tools'
    })
    .click();

  console.log('Tools clicked');

  await page.pause();

  await page.waitForLoadState('networkidle');

  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  await page.waitForLoadState('networkidle');

  console.log(
    'Current URL:',
    page.url()
  );

  const itemNumber =
    await page
      .locator('input')
      .evaluateAll(inputs => {

        for (const input of inputs) {

          const value =
            (input as HTMLInputElement).value;

          if (
            value &&
            value.startsWith('ITM')
          ) {
            return value;
          }
        }

        return null;
      });

  console.log(
    'Created Item:',
    itemNumber
  );

  console.log(
    'Mark As Visible:',
    await page
      .getByRole('menuitem', {
        name: /Mark As/i
      })
      .isVisible()
      .catch(() => false)
  );

  console.log(
    'Amend Visible:',
    await page
      .getByRole('button', {
        name: /Amend/i
      })
      .isVisible()
      .catch(() => false)
  );
});
