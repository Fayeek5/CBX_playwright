import { Page } from '@playwright/test';
import { client } from '../configs/client';

export async function login(page: Page) {
  await page.goto(client.baseUrl + '/home');
  await page.getByPlaceholder(/login/i).fill(client.username);
  await page.keyboard.press('Enter');
  await page.getByPlaceholder(/password/i).fill(client.password);
  await page.keyboard.press('Enter');
}
