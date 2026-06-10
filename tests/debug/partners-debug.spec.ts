import { test } from '@playwright/test';

test.use({
  storageState: 'fixtures/.auth/user.json'
});

test('debug partners', async ({ page }) => {

  await page.goto('/home');

  await page.waitForTimeout(8000);

  console.log('URL:', page.url());

  console.log(
    'BUTTON COUNT:',
    await page.locator('button').count()
  );

  console.log(
    'TAB ICON COUNT:',
    await page.locator('.tab-icon-button').count()
  );

  console.log(
    'BODY LENGTH:',
    (await page.locator('body').innerText()).length
  );

  await page.pause();
});
