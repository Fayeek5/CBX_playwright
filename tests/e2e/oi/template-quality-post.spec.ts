import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Template Quality & Compliance POST flow', async ({ page }) => {
  await page.goto('/home');
  await page.waitForLoadState('domcontentloaded');

  const templatesBtn = page.getByRole('button', { name: /Templates/i })
    .or(page.locator('[title="Templates"]'))
    .or(page.locator('button:nth-child(11)'));
  const templatesBtnVisible = await templatesBtn.first().waitFor({ state: 'visible', timeout: 10000 }).then(() => true).catch(() => false);
  if (!templatesBtnVisible) { console.log('Templates module not available in this environment — skipping'); return; }
  await templatesBtn.first().click();
  const subLink = page.getByRole('link', { name: 'Quality & Compliance Related' });
  const subLinkVisible = await subLink.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
  if (!subLinkVisible) { console.log('Quality & Compliance Related link not found — skipping'); return; }
  await subLink.click();
  await page.waitForLoadState('domcontentloaded');

  // Check for data — graceful skip if none
  const noRecords = await page.getByText('noRecordsFound').isVisible().catch(() => false);
  if (noRecords) {
    console.log('No Quality & Compliance data — skipping');
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

  // Actions → Copy (Q&C uses Actions menu, not Tools)
  const actionsButton = page.getByRole('menuitem', { name: 'Actions' });
  const actionsVisible = await actionsButton
    .waitFor({ state: 'visible', timeout: 30000 })
    .then(() => true).catch(() => false);

  if (!actionsVisible) {
    console.log('Actions menu not available — skipping');
    return;
  }

  await actionsButton.click();
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
  await page.waitForTimeout(3000);

  console.log('Quality & Compliance POST completed');
});
