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

      // Wait for the HOME menu item visible in top nav
      await this.page.getByText('HOME').waitFor({
        state: 'visible',
        timeout: 30000
      });

      return true;
    } catch {
      return false;
    }
  }
}
