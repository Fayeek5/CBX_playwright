import { test, expect } from '@playwright/test';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('Share File POST flow', async ({ page }) => {

  const fileName = `ShareFile_${Date.now()}.txt`;
  const fileContent = `Share File Test\nTimestamp=${Date.now()}`;
  const tempFile = path.join(os.tmpdir(), fileName);

  fs.writeFileSync(tempFile, fileContent);

  const originalHash = crypto
    .createHash('sha256')
    .update(fs.readFileSync(tempFile))
    .digest('hex');

  console.log('Original SHA256:', originalHash);
  console.log('Temporary file:', tempFile);

  await page.goto('/listing/share/sharedFile/sharedFileView');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  await page.mouse.move(1200, 300);
  await page.keyboard.press('Escape');

  const createButton = page.getByRole('menuitem', { name: 'Create' });
  await createButton.waitFor({ state: 'visible', timeout: 30000 });
  await createButton.click();

  await page.getByRole('menuitem', { name: 'Shared File' }).click();

  await page
    .getByRole('textbox', { name: /File Name/i })
    .fill(fileName);

  await page.locator('input[type="file"]').setInputFiles(tempFile);

  await page.getByRole('button', { name: 'Save & Confirm' }).click();

  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(5000);

  const downloadPromise = page.waitForEvent('download');

  await page.locator('.attachment-thumbnail').click();

  const download = await downloadPromise;
  const downloadPath = path.join(os.tmpdir(), 'downloaded_' + fileName);
  await download.saveAs(downloadPath);

  const downloadedHash = crypto
    .createHash('sha256')
    .update(fs.readFileSync(downloadPath))
    .digest('hex');

  console.log('Downloaded SHA256:', downloadedHash);

  expect(downloadedHash).toBe(originalHash);

  console.log('File integrity verified');
});
