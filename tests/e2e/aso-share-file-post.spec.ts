import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Share File POST flow', async ({ page }) => {

  const fileName = `ShareFile_${Date.now()}.txt`;

  const fileContent =
    `ASO Share File Test\nTimestamp=${Date.now()}`;

  const tempFile =
    path.join(os.tmpdir(), fileName);

  fs.writeFileSync(
    tempFile,
    fileContent
  );

  const originalHash =
    crypto
      .createHash('sha256')
      .update(fs.readFileSync(tempFile))
      .digest('hex');

  console.log(
    'Original SHA256:',
    originalHash
  );

  await page.goto(
    'https://aso-upgrade-qa.tradebeyond.com/home'
  );

  await page
    .locator('button:nth-child(12)')
    .click();

  await page
    .getByRole('link', {
      name: 'Share Content'
    })
    .click();

  await page.mouse.move(500, 300);

  await page.waitForTimeout(1000);

  await page
    .getByRole('menuitem', {
      name: 'Create'
    })
    .click();

  await page
    .getByRole('menuitem', {
      name: 'Shared File'
    })
    .click();

  await page
    .getByRole('textbox', {
      name: 'File Name: *'
    })
    .fill(fileName);

  await page
    .locator('input[type="file"]')
    .setInputFiles(tempFile);

  await page
    .getByRole('button', {
      name: 'Save & Confirm'
    })
    .click();

  const downloadPromise =
    page.waitForEvent('download');

  await page
    .locator('.attachment-thumbnail')
    .click();

  const download =
    await downloadPromise;

  const downloadPath =
    path.join(
      os.tmpdir(),
      'downloaded_' + fileName
    );

  await download.saveAs(
    downloadPath
  );

  const downloadedHash =
    crypto
      .createHash('sha256')
      .update(fs.readFileSync(downloadPath))
      .digest('hex');

  console.log(
    'Downloaded SHA256:',
    downloadedHash
  );

  expect(
    downloadedHash
  ).toBe(originalHash);

  console.log(
    'File integrity verified'
  );
});
