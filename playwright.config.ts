import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env (credentials, base URL, etc.)
dotenv.config({ path: path.resolve(__dirname, '.env') });

const BASE_URL = process.env.BASE_URL ?? 'https://oi-uat.tradebeyond.com';
const CI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',

  // Run files in parallel; within a file tests run serially by default.
  fullyParallel: false,

  // Fail the build on CI if test.only is accidentally left in source.
  forbidOnly: CI,

  // Retry on CI to absorb flakiness; no retries locally for fast feedback.
  retries: 1,

  // Limit workers on CI for stability; use all cores locally.
  workers: 1,

  // Global timeouts.
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  // Reporters: human-readable list + HTML report + JUnit for CI pipelines.
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  use: {
    baseURL: BASE_URL,

    // Artifacts for debugging failures.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Action / navigation timeouts.
    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    // Accept self-signed certs that UAT environments sometimes use.
    ignoreHTTPSErrors: true,
  },

  projects: [
    // ----------------------------------------------------------------
    // 1. "smoke": reachability / page-load checks. No login required, so
    //    you can verify connectivity to UAT before wiring up credentials.
    //    Run with: npm run test:smoke
    // ----------------------------------------------------------------
    {
      name: 'smoke',
      testDir: './tests/smoke',
      use: { ...devices['Desktop Chrome'] },
    },

    // ----------------------------------------------------------------
    // 2. "setup": performs login once and saves the auth state.
    //    The e2e project depends on it so tests start already logged in.
    // ----------------------------------------------------------------
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // ----------------------------------------------------------------
    // 3. "chromium": the authenticated e2e suite (your use cases).
    //    Reuses the session produced by "setup".
    // ----------------------------------------------------------------
    {
      name: 'chromium',
      testDir: './tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'fixtures/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Additional browsers are ready to switch on once the flow is stable.
    // {
    //   name: 'firefox',
    //   testDir: './tests/e2e',
    //   use: { ...devices['Desktop Firefox'], storageState: 'fixtures/.auth/user.json' },
    //   dependencies: ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   testDir: './tests/e2e',
    //   use: { ...devices['Desktop Safari'], storageState: 'fixtures/.auth/user.json' },
    //   dependencies: ['setup'],
    // },
  ],

  outputDir: 'test-results',
});
