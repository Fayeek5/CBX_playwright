import { Page } from '@playwright/test';

export async function markInactive(page: Page){
  await page.getByRole('menuitem',{name:'Mark as'}).hover();
  await page.getByRole('menuitem',{name:'Mark as'}).click();
  await page.getByRole('menuitem',{name:/Set to Inactive/i}).click();
}

export async function markActive(page: Page){
  await page.getByRole('menuitem',{name:'Mark as'}).hover();
  await page.getByRole('menuitem',{name:'Mark as'}).click();
  await page.getByRole('menuitem',{name:/Set to Active/i}).click();
}
