import { Page, Locator, expect } from '@playwright/test';

/**
 * Base class for all Page Objects.
 * Holds the Playwright `page` and exposes small, reusable helpers so the
 * individual page objects stay focused on element definitions + intent.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path relative to the configured baseURL. */
  async goto(path = '/'): Promise<void> {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
  }

  /** Wait until the network is idle — useful for SPA-heavy pages like CBX. */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /** Assert an element is visible within the default expect timeout. */
  async expectVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /** Current page title. */
  async title(): Promise<string> {
    return this.page.title();
  }

  /** Current URL. */
  url(): string {
    return this.page.url();
  }
}
