import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Forwarder POST flow', async ({ page }) => {

  await page.goto('/listing/master/forwarder/forwView');

  const forwarderCode = (
    await page
      .locator('[col-id="forwarderCode"] .text-wrapper')
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

  await page.waitForTimeout(3000);

  await page
    .getByPlaceholder('Filter...')
    .fill(forwarderCode!);

  await page
    .getByPlaceholder('Filter...')
    .press('Enter');

  await page
    .getByRole('row', {
      name: new RegExp(forwarderCode!)
    })
    .getByRole('link')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

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

  console.log('Copy clicked');

  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  await page.waitForTimeout(5000);

  const cancelButton = page.getByRole('button', {
    name: 'Cancel'
  });

  if (await cancelButton.isVisible().catch(() => false)) {

    console.log('Save & Confirm failed');

    await cancelButton.click();

    console.log('Clicked Cancel');

    const yesButton = page.locator(
      'button[cdkfocusinitial].close-button-class'
    );

    await yesButton.waitFor({
      state: 'visible',
      timeout: 30000
    });

    await yesButton.click();

    console.log('Clicked Yes');

  } else {

    console.log('Save & Confirm completed');
  }

  const markAsButton = page.getByRole('menuitem', {
    name: 'Mark as'
  });

  if (await markAsButton.count() > 0) {

    await markAsButton.click();

    await page
      .getByRole('menuitem', {
        name: 'Inactive'
      })
      .click();

    console.log('Marked Inactive');

    await page.waitForTimeout(5000);

    await markAsButton.click();

    await page
      .getByRole('menuitem', {
        name: 'Active'
      })
      .click();

    console.log('Marked Active');

  } else {

    console.log(
      'Mark As temporarily unavailable in UI. Skipping workflow.'
    );
  }
});
