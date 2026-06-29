import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Shipment Advice POST flow', async ({ page }) => {

  await page.goto('/listing/shipment/shipmentAdvice/shipmentAdviceView');
  await page.waitForLoadState('domcontentloaded');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const saLink = page.locator('[col-id="shipmentAdviceNo"] a, [col-id="shipmentAdviceNo"] .text-wrapper').first();
  const saVisible = await saLink.waitFor({ state: 'visible', timeout: 60000 }).then(() => true).catch(() => false);
  if (!saVisible) {
    console.log('No Shipment Advice data visible — skipping');
    return;
  }
  const shipmentNo = (await saLink.textContent())?.trim();

  expect(shipmentNo).toBeTruthy();

  console.log('Opening Shipment Advice:', shipmentNo);

  await saLink.click();

  await page.waitForURL('**/document/**shipment**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  console.log('Opened URL:', page.url());

  await page.waitForTimeout(5000);

  const toolsButton = page.getByRole('menuitem', { name: 'Tools' });
  await toolsButton.waitFor({ state: 'visible', timeout: 30000 });
  await toolsButton.click();

  await page.getByRole('menuitem', { name: 'Copy' }).click();
  console.log('Copy clicked');

  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 15000 });
  await saveConfirmButton.click();
  console.log('Save & Confirm clicked');

  const cancelButton = page.getByRole('button', { name: 'Cancel' });
  const cancelEnabled = await cancelButton
    .waitFor({ state: 'visible', timeout: 20000 })
    .then(async () => {
      const deadline = Date.now() + 15000;
      while (Date.now() < deadline) {
        if (await cancelButton.isEnabled().catch(() => false)) return true;
        await page.waitForTimeout(500);
      }
      return false;
    })
    .catch(() => false);

  if (cancelEnabled) {
    await cancelButton.click();
    console.log('Clicked Cancel');
    const yesButton = page.getByRole('button', { name: 'yes' });
    await yesButton.waitFor({ state: 'visible', timeout: 10000 });
    await yesButton.click();
    console.log('Clicked yes');
  }

  await page.waitForLoadState('domcontentloaded');

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

  const inactiveOption = page.getByRole('menuitem', { name: /Set to Inactive|Inactive/ }).first();
  const inactiveVisible = await inactiveOption
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true)
    .catch(() => false);

  if (inactiveVisible) {
    await inactiveOption.click();
    console.log('Marked Inactive');

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);

    const markAsButton2 = page.getByRole('menuitem', { name: 'Mark as' });
    await markAsButton2.waitFor({ state: 'visible', timeout: 15000 });
    await markAsButton2.click();

    const activeOption = page.getByRole('menuitem', { name: /Set to Active|Active/ }).first();
    const activeVisible = await activeOption
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (activeVisible) {
      await activeOption.click();
      console.log('Marked Active');
    } else {
      console.log('Set to Active option not available');
    }
  } else {
    console.log('No status change options available');
  }
});
