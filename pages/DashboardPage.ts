import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async isLoaded(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/home', {
        timeout: 30000
      });

      await this.page.waitForLoadState('networkidle');

      return true;
    } catch {
      return false;
    }
  }
}
