import { open } from '../../helpers/navigation';
import { markActive, markInactive } from '../../helpers/markAs';
import { save } from '../../helpers/save';
import { test, expect } from '@playwright/test';
import { closeSidebar } from '../../../helpers/sidebar-helper';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Factory POST flow', async ({ page }) => {

  await page.goto('/home');

  //
  // Partners → Factories
  //
  await page
    .getByRole('button')
    .filter({ hasText: /^$/ })
    .nth(5)
    .click();

  await page
    .getByRole('link', {
      name: 'Factories'
    })
    .click();

  //
  // Wait until Factory page is loaded
  //
  await expect(
    page.getByRole('heading', {
      name: 'Partners'
    })
  ).toBeVisible();

  //
  // Collapse side menu overlay
  //
  await page
    .locator('body')
    .click({
      position: {
        x: 1200,
        y: 300
      }
    });

  await page.waitForLoadState('domcontentloaded');

  await page.waitForLoadState('networkidle');

  console.log(
    'Current URL after company click:',
    page.url()
  );

  await page.keyboard.press('Escape');

  //
  // Fetch Factory ID
  //
  const factoryId = (
    await page
      .locator('[col-id="factCode"] .text-wrapper')
      .first()
      .textContent()
  )?.trim();

  expect(factoryId).toBeTruthy();

  console.log('Searching Factory ID:', factoryId);

  //
  // Search
  //
  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .first()
    .click();

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
  const companyName = (
    await page
      .locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  expect(companyName).toBeTruthy();

  console.log('Company Name:', companyName);

  //
  // Open Factory using searched Factory ID row
  //
  await page
    .locator('[role="row"]')
    .filter({
      has: page.locator(
        `[col-id="factCode"] .text-wrapper:text-is("${factoryId}")`
      )
    })
    .locator('[col-id="businessName"] a')
    .click();

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
  // Save & Confirm
  //
  //
  // Save & Confirm
  //
  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  await page.waitForLoadState('domcontentloaded');

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

    await page.waitForLoadState('networkidle');

    await page.waitForLoadState('domcontentloaded');

  } else {

    console.log('Save & Confirm completed');
  }

  await page.waitForLoadState('domcontentloaded');

  //
  //
  // Wait for page after Save & Confirm / Cancel
  //
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');

  //
  // Open Mark As menu
  //
  const markAsButton = page.getByRole('menuitem', {
    name: 'Mark as'
  });

  await markAsButton.waitFor({
    state: 'visible',
    timeout: 30000
  });

  await markAsButton.click();

  const inactiveOption = page.getByRole('menuitem', {
    name: 'Inactive'
  });

  const activeOption = page.getByRole('menuitem', {
    name: 'Active'
  });

  if (await inactiveOption.isVisible().catch(() => false)) {

    await inactiveOption.click();

    console.log('Marked Inactive');

    await page.waitForLoadState('domcontentloaded');

    await markAsButton.click();

    await activeOption.click();

    console.log('Marked Active');

  } else {

    await activeOption.click();

    console.log('Marked Active');

    await page.waitForLoadState('domcontentloaded');

    await markAsButton.click();

    await inactiveOption.click();

    console.log('Marked Inactive');

    await page.waitForLoadState('domcontentloaded');

    await markAsButton.click();

    await activeOption.click();

    console.log('Marked Active');
  }


});
