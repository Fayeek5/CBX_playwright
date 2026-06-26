import { test, expect } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Vendor Search flow', async ({ page }) => {

  await page.goto('/listing/master/vendor/vendorView');

  await expect(
    page.getByText(/\d+\s+Records/i)
  ).toBeVisible({
    timeout: 30000
  });

  const supplierId = (
    await page
      .getByRole('gridcell')
      .nth(2)
      .textContent()
  )?.trim();

  expect(supplierId).toBeTruthy();

  const vendorName = (
    await page
      .locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  expect(vendorName).toBeTruthy();

  console.log(
    'Searching Supplier ID:',
    supplierId
  );

  console.log(
    'Vendor Name:',
    vendorName
  );

  await page
    .getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click();

  await page
    .getByPlaceholder('Filter...')
    .fill(supplierId!);

  await page
    .getByRole('button', {
      name: 'Apply'
    })
    .click();

  await expect(
    page.getByRole('gridcell', {
      name: supplierId!
    })
  ).toBeVisible();

  await page
    .getByRole('row', {
      name: new RegExp(vendorName!)
    })
    .getByLabel('', { exact: true })

  console.log(
    'Vendor search completed:',
    supplierId
  );

});
