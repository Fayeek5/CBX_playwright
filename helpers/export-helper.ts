import { Page, expect } from '@playwright/test';

export async function exportSelectedRows(page: Page) {
  await page.locator(
    'app-export-data > .edit-toggle'
  ).click();

  const selectedRows =
    page.getByText(
      'Selected Rows Only'
    );

  await expect(
    selectedRows
  ).toBeVisible({
    timeout: 30000
  });

  await selectedRows.click();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /export/i
  }).click();

  const download = await downloadPromise;

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  expect(
    download.suggestedFilename()
  ).toBeTruthy();

  return download;
}
