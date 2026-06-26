import { Page } from '@playwright/test';
import { client } from '../configs/client';

export async function open(page: Page, path: string) {
  await page.goto(`${client.baseUrl}${path}`);
}
