import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Forwarder POST flow', async ({ page }) => {

  await page.goto('/listing/master/forwarder/forwView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const forwarderLink = page.locator('[col-id="forwarderCode"] a').first();
  const forwarderCode = (await forwarderLink.textContent())?.trim();

  expect(forwarderCode).toBeTruthy();

  console.log('Searching Forwarder:', forwarderCode);

  try {
    await page.getByRole('button').filter({ hasText: 'filter_alt' }).nth(1).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page.getByPlaceholder('Filter...').fill(forwarderCode!);
  await page.getByRole('button', { name: 'Apply' }).click();
  await page.waitForLoadState('domcontentloaded');

  await page.locator('[col-id="forwarderCode"] a').first().click();

  await page.waitForURL('**/document/master/forwarder/**', { timeout: 30000 });
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

  await page.waitForTimeout(20000);
  await page.waitForLoadState('domcontentloaded');
  console.log('Save & Confirm completed');

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
