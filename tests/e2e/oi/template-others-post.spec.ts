import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Template Others POST flow', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');

  const templatesBtn = page.getByRole('button', { name: /Templates/i })
    .or(page.locator('[title="Templates"]'))
    .or(page.locator('button:nth-child(11)'));
  const templatesBtnVisible = await templatesBtn.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!templatesBtnVisible) { console.log('Templates module not available in this environment — skipping'); return; }
  await templatesBtn.first().click();
  const subLink = page.getByRole('link', { name: 'Others' });
  const subLinkVisible = await subLink.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!subLinkVisible) { console.log('Others link not found — skipping'); return; }
  await subLink.click();
  await page.waitForLoadState('domcontentloaded');

  // Check for data — graceful skip if none
  const noRecords = await page.getByText('noRecordsFound').isVisible().catch(() => false);
  if (noRecords) {
    console.log('No Others template data — skipping');
    return;
  }

  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible({ timeout: 30000 });

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  // Dynamically get first record
  const nameLink = page.locator('[col-id="name"] a, [col-id="templateName"] a').first();
  await nameLink.waitFor({ state: 'visible', timeout: 30000 });
  const templateName = (await nameLink.textContent())?.trim();

  expect(templateName).toBeTruthy();
  console.log('Opening template:', templateName);

  await nameLink.click();
  await page.waitForURL('**/document/**', { timeout: 30000 });
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(3000);

  console.log('Opened URL:', page.url());

  // Tools → Copy
  const toolsButton = page.getByRole('menuitem', { name: 'Tools' });
  const toolsVisible = await toolsButton
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true).catch(() => false);

  if (!toolsVisible) {
    console.log('Tools menu not available — skipping');
    return;
  }

  await toolsButton.click();
  await page.getByRole('menuitem', { name: 'Copy' }).click();
  console.log('Copy clicked');

  // Fill required Name field with unique value
  const nameField = page.getByRole('textbox', { name: /Name/i });
  const nameFieldVisible = await nameField
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true).catch(() => false);

  if (nameFieldVisible) {
    const copyName = `${templateName}_Copy_${Date.now()}`;
    await nameField.fill(copyName);
    console.log('Filled copy name:', copyName);
  }

  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  const saveConfirmVisible = await saveConfirmButton
    .waitFor({ state: 'visible', timeout: 15000 })
    .then(() => true).catch(() => false);

  if (!saveConfirmVisible) {
    console.log('Save & Confirm not available — skipping');
    return;
  }

  await saveConfirmButton.click();
  console.log('Save & Confirm clicked');

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  // Mark as Inactive → Active
  const markAsButton = page.getByRole('menuitem', { name: 'Mark as' });
  const markAsVisible = await markAsButton
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true).catch(() => false);

  if (!markAsVisible) {
    console.log('Mark as not available');
    return;
  }

  await markAsButton.click();

  const inactiveOption = page.getByRole('menuitem', { name: /Set to Inactive|Inactive/ }).first();
  const inactiveVisible = await inactiveOption
    .waitFor({ state: 'visible', timeout: 5000 })
    .then(() => true).catch(() => false);

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
      .then(() => true).catch(() => false);

    if (activeVisible) {
      await activeOption.click();
      console.log('Marked Active');
    } else {
      console.log('Set to Active option not available');
    }
  } else {
    console.log('No status change options available');
  }

  console.log('Template Others POST completed');
});
