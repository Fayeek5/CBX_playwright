import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Item POST flow', async ({ page }) => {

  await page.goto('/listing/product/item/itemView');

  //
  // Fetch Item No dynamically
  //
  const itemNo = (
    await page
      .locator('[col-id="itemNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(itemNo).toBeTruthy();

  console.log('Searching Item:', itemNo);

  //
  // Search Item
  //
  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page.getByPlaceholder('Filter...').fill(itemNo!);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  //
  // Open Item
  //
  await page
    .getByRole('link', {
      name: itemNo!
    })
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

  console.log('Save & Confirm completed');

  //
  // Try Mark As directly
  //
  try {

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click({
        timeout: 5000
      });

  } catch {

    console.log('Mark As unavailable, performing Cancel → Yes');

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

    console.log('Clicked Cancel');
    console.log('Clicked Yes');

    await page.waitForTimeout(5000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();
  }

  //
  // Dynamic Mark As
  //
  const inactiveOption = page.getByRole('menuitem', {
    name: 'Inactive'
  });

  const activeOption = page.getByRole('menuitem', {
    name: 'Active'
  });

  if (await inactiveOption.isVisible().catch(() => false)) {

    await inactiveOption.click();

    console.log('Marked Inactive');

    await page.waitForTimeout(5000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();

    await activeOption.click();

    console.log('Marked Active');

  } else {

    await activeOption.click();

    console.log('Marked Active');

    await page.waitForTimeout(5000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();

    await page
      .getByRole('menuitem', {
        name: 'Inactive'
      })
      .click();

    console.log('Marked Inactive');

    await page.waitForTimeout(5000);

    await page
      .getByRole('menuitem', {
        name: 'Mark as'
      })
      .click();

    await page
      .getByRole('menuitem', {
        name: 'Active'
      })
      .click();

    console.log('Marked Active');
  }

});
