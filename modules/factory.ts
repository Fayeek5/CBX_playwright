import { Page, expect } from '@playwright/test';
import { search } from '../helpers/search-helper';
import { exportSelectedRows } from '../helpers/export-helper';
import { demoPause } from '../helpers/demo-helper';

export async function runFactory(page: Page) {

  await page.goto('/home');

  await page.waitForLoadState('networkidle');

  await page.locator('button:nth-child(9)').click();

  await page.getByRole('link', {
    name: 'Factories'
  }).click();

  await expect(page)
    .toHaveURL(/factActiveView/);

  await demoPause(page);

  await expect(
    page.locator('.total-record-indicator')
  ).toContainText('Records', {
    timeout: 30000
  });

  const factoryLink =
    page.locator('[col-id="businessName"] a')
      .first();

  const companyName = (
    await factoryLink.textContent()
  )?.trim();

  const href =
    await factoryLink.getAttribute('href');

  const factoryId =
    href?.match(/\/fact\/(.*?)\//)?.[1];

  console.log('Factory ID:', factoryId);
  console.log('Company Name:', companyName);

  await search(
    page,
    companyName!,
    2
  );

  await expect(factoryLink)
    .toContainText(companyName!);

  console.log(
    'Verified search:',
    companyName
  );

  await page.mouse.click(1200, 200);
  await page.keyboard.press('Escape');

  await demoPause(page);

  await page.getByLabel('', {
    exact: true
  }).nth(1).check();

  const download =
    await exportSelectedRows(page);

  console.log(
    'Export file:',
    download.suggestedFilename()
  );

  await factoryLink.click();

  await demoPause(page);

  await expect(page)
    .toHaveURL(/document\/master\/fact/i);

  await expect(page.url())
    .toContain(factoryId!);

  await expect(
    page.getByRole('heading', {
      name: companyName!
    })
  ).toBeVisible();

  await expect(
    page.getByText(factoryId!, {
      exact: true
    })
  ).toBeVisible();

  console.log(
    'Verified Company Name:',
    companyName
  );

  console.log(
    'Verified Factory ID:',
    factoryId
  );

  console.log(
    'Opened Factory URL:',
    page.url()
  );

  console.log(
    'Factory completed:',
    factoryId
  );
}
