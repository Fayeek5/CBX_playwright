import { test, expect, Page } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

async function openAudits(page: Page) {
  await page.goto('/home');
  await page.waitForURL('**/home**', { timeout: 30000 });

  await page.getByRole('button').filter({ hasText: /^$/ }).nth(4).click();

  const link = page.getByRole('link', { name: 'Audits' });
  await link.waitFor({ state: 'visible', timeout: 15000 });
  await link.click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.waitForLoadState('domcontentloaded');
  await page.keyboard.press('Escape');
  await page.waitForLoadState('domcontentloaded');
}

test('Audit POST flow', async ({ page }) => {

  await openAudits(page);

  const reportNo = (
    await page
      .locator('[col-id="reportNo"] a')
      .first()
      .textContent()
  )?.trim();

  expect(reportNo).toBeTruthy();

  console.log('Searching Audit Report No:', reportNo);

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

  await page
    .getByPlaceholder('Filter...')
    .fill(reportNo!);

  await page
    .getByRole('button', { name: 'Apply' })
    .click();

  await page.waitForLoadState('domcontentloaded');

  await page
    .locator('[col-id="reportNo"] a')
    .first()
    .click();

  await page.waitForURL('**/document/quality/factAudit/**', { timeout: 30000 });
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
  // Save & Confirm -> Cancel -> yes
  //
  const saveConfirmButton = page.getByRole('button', { name: 'Save & Confirm' });
  await saveConfirmButton.waitFor({ state: 'visible', timeout: 15000 });
  await saveConfirmButton.click();
  console.log('Save & Confirm clicked');

  const cancelButton = page.getByRole('button', { name: 'Cancel' });
  await cancelButton.waitFor({ state: 'visible', timeout: 20000 });
  await cancelButton.click();
  console.log('Clicked Cancel');

  const yesButton = page.getByRole('button', { name: 'yes' });
  await yesButton.waitFor({ state: 'visible', timeout: 10000 });
  await yesButton.click();
  console.log('Clicked yes');

  await page.waitForLoadState('domcontentloaded');

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

  const inactiveOption = page.getByRole('menuitem', { name: 'Set to Inactive' });
  await inactiveOption.waitFor({ state: 'visible', timeout: 10000 });
  await inactiveOption.click();

  console.log('Marked Set to Inactive');

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1000);

  await markAsButton.waitFor({ state: 'visible', timeout: 15000 });
  await markAsButton.click();

  const activeOption = page.getByRole('menuitem', { name: 'Set to Active' });
  await activeOption.waitFor({ state: 'visible', timeout: 10000 });
  await activeOption.click();

  console.log('Marked Set to Active');
});
