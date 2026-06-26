import { test, expect } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('ASO Share File POST flow', async ({ page }) => {

const tempFile = path.join(
  os.tmpdir(),
  `share-file-${Date.now()}.txt`
);

fs.writeFileSync(
  tempFile,
  `Playwright Share File Test\nCreated: ${new Date().toISOString()}\n`
);

console.log('Temporary file:', tempFile);
  await page.goto('/home');
  await page.locator('button:nth-child(10)').click();
  await page.getByRole('link', { name: 'Share Content' }).click();

await page.mouse.move(800, 400);

await page.waitForTimeout(1000);
  await page.getByRole('menuitem', { name: 'Create' }).click();
  await page.getByRole('menuitem', { name: 'New Shared File' }).click();
  await page.getByRole('textbox', { name: 'File Name: *' }).click();
  await page.getByRole('textbox', { name: 'File Name: *' }).fill('testing');
  await page.getByText('browse your files').click();
  await page.locator('input[type="file"]').setInputFiles(tempFile);
  await page.getByRole('button', { name: 'Save & Confirm' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'yes' }).click();


fs.unlinkSync(tempFile);

});