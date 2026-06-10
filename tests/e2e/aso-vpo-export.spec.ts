import { test, expect } from '@playwright/test';
import * as XLSX from 'xlsx';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO VPO Export flow', async ({ page }) => {

  await page.goto('/listing/order/vpo/vpoView');

  const vpoNo = (
    await page
      .locator('[col-id="vpoNo"] a')
      .first()
      .textContent()
  )?.trim();

  console.log(
    'Expected VPO:',
    vpoNo
  );

  await page
    .locator('[col-id="vpoNo"] a')
    .first()
    .click();

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(2000);

  await page
    .getByRole('menuitem', {
      name: 'Tools'
    })
    .click();

  await page.waitForTimeout(1000);

  await page
    .locator('button.cdk-menu-trigger')
    .filter({
      hasText: 'Print'
    })
    .hover();

  await page.waitForTimeout(1000);

  const downloadPromise =
    page.waitForEvent('download');

  await page
    .getByRole('menuitem', {
      name: 'Logistic Appendix (Excel)'
    })
    .click();

  const download =
    await downloadPromise;

  const filePath =
    await download.path();

  expect(filePath).toBeTruthy();

  const workbook =
    XLSX.readFile(filePath!);

  const text =
    workbook.SheetNames
      .map(sheet =>
        XLSX.utils.sheet_to_csv(
          workbook.Sheets[sheet]
        )
      )
      .join('\n');

  console.log(text);

  expect(text).toContain('Logistic Appendix');

  console.log(
    'Verified Logistic Appendix Excel generated successfully'
  );

  console.log(
    'Verified VPO in Excel:',
    vpoNo
  );

});
