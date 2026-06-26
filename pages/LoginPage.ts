import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.getByPlaceholder('Login ID');
    this.passwordInput = page.getByPlaceholder('Password');
    this.submitButton = page.locator('#login-button');
  }

  async open(): Promise<void> {
    await this.goto('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });

    await this.usernameInput.fill(username);

    await this.passwordInput.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.passwordInput.click();
    await this.passwordInput.fill(password);

    // Trigger validation like a real user
    await this.passwordInput.press('Tab');

    await this.submitButton.waitFor({
      state: 'visible',
      timeout: 10000
    });

    await this.page.waitForTimeout(1000);

    await this.submitButton.click({ force: true });
  }
}
