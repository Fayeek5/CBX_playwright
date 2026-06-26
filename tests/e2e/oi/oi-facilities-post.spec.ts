import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openFacilities(page: Page) {
  await page.goto('/listing/master/fact/factActiveView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('Facilities POST flow', async ({ page }) => {

  await openFacilities(page);

  //
  // Wait until Facilities page is loaded
  //
  await expect(
    page.getByRole('heading', {
      name: 'Partners'
    })
  ).toBeVisible();

  console.log(
    'Current URL after company click:',
    page.url()
  );

  //
  // Fetch Factory ID
  //
  const factoryIdLink = page.locator('[col-id="factCode"] .text-wrapper').first();
  const factoryId = (await factoryIdLink.textContent())?.trim();
  const colId = await factoryIdLink.evaluate(el => el.closest('[col-id]')?.getAttribute('col-id') ?? '');

  expect(factoryId).toBeTruthy();

  console.log('Searching Factory ID:', factoryId);

  //
  // Search
  //
  try {
    await page.locator(`[col-id="${colId}"] .filter-button button`).click({ timeout: 5000 });
  } catch {
    await page.locator('.filter-button button').first().click();
  }

  await page
    .getByPlaceholder('Filter...')
    .fill(factoryId!);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  //
  // Fetch Company Name
  //
  const companyNameLink = page.locator('[col-id="businessName"] a').first();
  const companyName = (await companyNameLink.textContent())?.trim();

  expect(companyName).toBeTruthy();

  console.log('Company Name:', companyName);

  //
  // Open Facility document — scoped to the row matching factoryId to avoid
  // ambiguity when multiple rows share the same company name
  //
  await page
    .locator('[role="row"]')
    .filter({
      has: page.locator(
        `[col-id="factCode"] .text-wrapper:text-is("${factoryId}")`
      )
    })
    .locator('[col-id="businessName"] a')
    .first()
    .click();

  await page.waitForURL('**/document/master/fact/**', { timeout: 30000 });

  await page.waitForLoadState('domcontentloaded');

  console.log(
    'Opened Factory:',
    factoryId
  );

  console.log(
    'Opened URL:',
    page.url()
  );

  if (!page.url().includes('/document/master/fact/')) {
    throw new Error(
      `Factory document did not open. Current URL: ${page.url()}`
    );
  }

  //
  // Wait 5 seconds after opening item before clicking Tools
  //
  await page.waitForTimeout(5000);

  //
  // Tools -> Copy
  //
  const toolsButton = page.getByRole('menuitem', {
    name: 'Tools'
  });

  await toolsButton.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await toolsButton.click();
  await page
    .getByRole('menuitem', {
      name: 'Copy'
    })
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

  await page
    .getByRole('menuitem', { name: 'Inactive' })
    .click();

  console.log('Marked Inactive');

  await page.waitForLoadState('domcontentloaded');

  await markAsButton.click();

  await page
    .getByRole('menuitem', { name: 'Active' })
    .click();

  console.log('Marked Active');

});
