import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Forwarder POST flow', async ({ page }) => {

  await page.goto('/home');

  await page
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  const forwarderLink = page.getByRole('link', { name: 'Forwarders' });
  await forwarderLink.waitFor({ state: 'visible', timeout: 15000 });
  await forwarderLink.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  //
  // Move cursor away to dismiss the sidenav overlay
  //
  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');

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

  await page.waitForLoadState('domcontentloaded');

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

  await page.waitForURL('**/document/master/forwarder/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');

  console.log('Opened URL:', page.url());

  //
  // Wait 5 seconds after opening item before clicking Tools
  //
  await page.waitForTimeout(5000);

  //
  // Tools -> Copy
  //
  const toolsButton = page.getByRole('menuitem', { name: 'Tools' });
  await toolsButton.waitFor({ state: 'visible', timeout: 30000 });
  await toolsButton.click();

  await page
    .getByRole('menuitem', { name: 'Copy' })
    .click();

  console.log('Copy clicked');

  //
  // Save & Confirm — if it errors, click Cancel then Yes to dismiss
  //
  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 15000 });

  let saveConfirmFailed = false;

  try {
    await saveConfirmButton.click();
    console.log('Save & Confirm clicked');
  } catch {
    saveConfirmFailed = true;
    console.log('Save & Confirm click failed');
  }

  if (!saveConfirmFailed) {
    //
    // Wait 20 seconds after Save & Confirm for processing
    //
    await page.waitForTimeout(20000);
    await page.waitForLoadState('domcontentloaded');
    console.log('Save & Confirm completed');
  }

  //
  // If Save & Confirm failed, click Cancel then Yes
  //
  if (saveConfirmFailed) {
    const cancelButton = page.getByRole('button', { name: 'Cancel' });
    const cancelVisible = await cancelButton
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (cancelVisible) {
      await cancelButton.click();
      console.log('Clicked Cancel');

      const yesButton = page.getByRole('button', { name: 'Yes' });
      await yesButton.waitFor({ state: 'visible', timeout: 10000 });
      await yesButton.click();
      console.log('Clicked Yes');

      await page.waitForLoadState('domcontentloaded');
    }
  }

  //
  // Wait until Mark as is visible and clickable; if not, stop
  //
  const markAsButton = page.getByRole('menuitem', { name: 'Mark as' });

  const markAsVisible = await markAsButton
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true)
    .catch(() => false);

  if (!markAsVisible) {
    console.log('Mark as functionality not exist');
    return;
  }

  await markAsButton.click();

  const inactiveOption = page.getByRole('menuitem', { name: 'Inactive' });
  await inactiveOption.waitFor({ state: 'visible', timeout: 10000 });
  await inactiveOption.click();

  console.log('Marked Inactive');

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  await markAsButton.waitFor({ state: 'visible', timeout: 15000 });
  await markAsButton.click();

  const activeOption = page.getByRole('menuitem', { name: 'Active' });
  await activeOption.waitFor({ state: 'visible', timeout: 10000 });
  await activeOption.click();

  console.log('Marked Active');
});
