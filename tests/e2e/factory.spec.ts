import { test, expect } from '@playwright/test';
const XLSX = require('xlsx');

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('GET Factory', async ({ page }) => {

  await page.goto('/home');

  await page.waitForTimeout(5000);

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', { name: 'Factories' }).click();

  await expect(page).toHaveURL(/factActiveView/);

  await page.waitForTimeout(5000);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  // Capture first company from grid
  const companyName = (
    await page.locator('[col-id="businessName"] a')
      .first()
      .textContent()
  )?.trim();

  const companyLink = await page
    .locator('[col-id="businessName"] a')
    .first()
    .getAttribute('href');

  const factoryId =
    companyLink?.match(/\/fact\/(.*?)\//)?.[1];

  const shortName =
    companyName!
      .split(' ')
      .slice(0, 2)
      .join(' ');

  console.log('Factory ID:', factoryId);
  console.log('Company Name:', companyName);
  console.log('Expected Short Name:', shortName);

  expect(factoryId).toBeTruthy();
  expect(companyName).toBeTruthy();

  // Close Partners overlay
  await page.mouse.click(1200, 200);

  await page.waitForTimeout(1000);

  // Search using captured company name
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(2)
    .click();

  await page.getByPlaceholder('Filter...')
    .fill(companyName!);

  await page.getByRole('button', {
    name: 'Apply'
  }).click();

  await expect(
    page.locator('[col-id="businessName"] a').first()
  ).toContainText(companyName!);

  await page.waitForTimeout(5000);

  console.log(
    'Verified search result:',
    companyName
  );

  // Select row
  await page.getByLabel('', { exact: true })
    .nth(1)
    .check();

  // Export
  await page.locator('app-export-data > .edit-toggle')
    .click();

  await page.getByText('Selected Rows Only')
    .click();

  const downloadPromise =
    page.waitForEvent('download');

  await page.getByRole('button', {
    name: 'Export'
  }).click();

  const download =
    await downloadPromise;

  await page.waitForTimeout(5000);

  const downloadPath =
    await download.path();

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  const workbook =
    XLSX.readFile(downloadPath);

  const sheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

  const data =
    XLSX.utils.sheet_to_json(
      sheet,
      { header: 1 }
    );

  const exportText =
    JSON.stringify(data);


  expect(exportText)
    .toContain(factoryId!);

  console.log(
    'Verified Factory ID in export:',
    factoryId
  );

  // Open factory document
  await page.locator('[col-id="businessName"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);

  await expect(page)
    .toHaveURL(/\/document\/master\/fact\//);

  await expect(page)
    .toHaveURL(new RegExp(factoryId!));

  console.log(
    'Opened Factory URL:',
    page.url()
  );
});
