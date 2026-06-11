import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO VPO POST flow', async ({ page }) => {

  await page.goto('/listing/order/vpo/vpoView');

  //
  // Open VPO
  //
  await page
    .locator('[col-id="vpoNo"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  //
  // Copy
  //
  await page
    .getByRole('menuitem', {
      name: 'Tools'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Copy'
    })
    .click();

  //
  // Save & Confirm
  //
  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  await page.waitForTimeout(5000);

  //
  // Cancel copied document
  //
  await page
    .getByRole('button', {
      name: 'Cancel'
    })
    .click();

  await page
    .getByRole('button', {
      name: 'yes'
    })
    .click();

  console.log(
    'Copy flow completed'
  );

  //
  
  //
  // Mark As workflow
  //
  await page
    .getByRole('menuitem', {
      name: 'Mark as'
    })
    .click();

  if (
    await page
      .getByRole('menuitem', {
        name: 'Inactive'
      })
      .count() > 0
  ) {

    await page
      .getByRole('menuitem', {
        name: 'Inactive'
      })
      .click();

    console.log(
      'Marked Inactive'
    );

    await page.waitForTimeout(3000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();

    if (
      await page
        .getByRole('menuitem', {
          name: 'Active'
        })
        .count() > 0
    ) {

      const activeButton = page.getByRole('menuitem', {
        name: 'Active'
      });

      await activeButton.waitFor({
        state: 'visible',
        timeout: 30000
      });

      await activeButton.click();

      console.log(
        'Marked Active'
      );
    }
  }
  else if (
    await page
      .getByRole('menuitem', {
        name: 'Active'
      })
      .count() > 0
  ) {

    await page
      .getByRole('menuitem', {
        name: 'Active'
      })
      .click();

    console.log(
      'Marked Active'
    );

    await page.waitForTimeout(3000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();

    if (
      await page
        .getByRole('menuitem', {
          name: 'Inactive'
        })
        .count() > 0
    ) {

      await page
        .getByRole('menuitem', {
          name: 'Inactive'
        })
        .click();

      console.log(
        'Marked Inactive'
      );

      await page.waitForTimeout(3000);

      await page
        .getByRole('menuitem', {
          name: 'Mark as'
        })
        .click();

      if (
        await page
          .getByRole('menuitem', {
            name: 'Active'
          })
          .count() > 0
      ) {

        await page
          .getByRole('menuitem', {
            name: 'Active'
          })
          .click();

        console.log(
          'Marked Active again'
        );
      }
    }
  }
});
