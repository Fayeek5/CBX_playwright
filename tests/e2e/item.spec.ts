import { test, expect } from '@playwright/test';
import ExcelJS from 'exceljs';

function cellValueToText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  if ('formula' in value && value.formula) {
    return value.formula;
  }

  if ('text' in value && value.text) {
    return value.text;
  }

  if ('richText' in value && value.richText) {
    return value.richText.map(({ text }) => text).join('');
  }

  if ('result' in value && value.result !== undefined) {
    return String(value.result);
  }

  return JSON.stringify(value);
}

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Item module smoke test', async ({ page }) => {



  // Open Items
  // Open Home first
await page.goto('https://oi-uat.tradebeyond.com/home');

await page.waitForLoadState('domcontentloaded');

// Wait until left navigation is rendered
await expect(
  page.locator('.tab-list .tab-icon-button').nth(4)
).toBeVisible({ timeout: 30000 });

// Give dashboard widgets time to settle
await page.waitForTimeout(3000);

// Open Product module
await page.locator('.tab-list .tab-icon-button').nth(4).click();

// Open Items
await page.getByRole('link', { name: 'Items' }).click();

// Verify listing loaded
await expect(page).toHaveURL(/itemActiveView/);
  await page.waitForTimeout(5000);

  // Dismiss sidenav overlay
  await page.mouse.click(1200, 200);

  await page.waitForLoadState('networkidle');

  // close side menu overlay
  await page.keyboard.press('Escape');

  // Verify listing loaded
  await expect(page).toHaveURL(/itemActiveView/);
  await expect(page.getByText('Items - Active')).toBeVisible();

  // Verify record count visible
  await expect(page.getByText(/\d+\s+Records/i)).toBeVisible();

  // Search
  await page.getByRole('button')
    .filter({ hasText: 'filter_alt' })
    .nth(1)
    .click({ force: true });

  await page.getByPlaceholder('Filter...').fill('ITM2605-001316');

  await page.getByRole('button', { name: 'Apply' }).click();

  // Verify search result exists
  await expect(
    page.getByText('ITM2605-001316')
  ).toBeVisible();

  // Select first row
  await page.getByLabel('', { exact: true }).nth(1).check();

  // Export
  await page.locator('app-export-data > .edit-toggle').click();

  await page.getByRole('checkbox', {
    name: 'Selected Rows Only'
  }).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /export/i
  }).click();

  const download = await downloadPromise;
  const filename = download.suggestedFilename();
  expect(filename).toBeTruthy();

  // Use Playwright's temp path — file is already fully written here
  const exportPath = await download.path();
  if (!exportPath) throw new Error('Download failed — no file path returned');

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(exportPath);

  const worksheet = workbook.worksheets[0];
  const sheetText: string[] = [];

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      sheetText.push(cellValueToText(cell.value));
    });
  });

  expect(sheetText.join(' ')).toContain('ITM2605-001316');

  console.log('Export file:', filename);
  console.log('Export path:', exportPath);

  // Capture Item No dynamically from grid
  const itemNo = (
    await page.locator('[col-id="itemNo"] a').first().textContent()
  )?.trim();

  console.log('Selected Item:', itemNo);

  // Open Item document
  await page.locator('[col-id="itemNo"] a').first().click();

  await page.waitForURL(/document\/product\/item/);

  // Verify URL contains same Item No
  expect(page.url()).toContain(itemNo!);

  // Verify Item No is visible in document
  await expect(
    page.getByText(itemNo!)
  ).toBeVisible();

  console.log(
    'Verified Item No:',
    itemNo
  );

  console.log(
    'Opened Item URL:',
    page.url()
  );
});
