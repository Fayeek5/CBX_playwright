import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Vendor POST flow', async ({ page }) => {

  await page.goto('/listing/master/vendor/vendorView');
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const vendorLink = page.locator('[col-id="businessName"] a').first();
  await vendorLink.waitFor({ state: 'visible', timeout: 30000 });
  const vendorName = (await vendorLink.textContent())?.trim();

  expect(vendorName).toBeTruthy();
  console.log('Opening Vendor:', vendorName);

  await vendorLink.click();

  await page.waitForURL('**/document/**vendor**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  console.log('Opened URL:', page.url());

  const toolsButton = page.getByRole('menuitem', { name: 'Tools' });
  await toolsButton.waitFor({ state: 'visible', timeout: 30000 });
  await toolsButton.click();

  await page.getByRole('menuitem', { name: 'Copy' }).click();
  console.log('Copy clicked');

  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 15000 });
  await saveConfirmButton.click();
  console.log('Save & Confirm clicked');

  await page.waitForTimeout(20000);
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
