# CBX Cloud (TradeBeyond) — OI UAT UI Automation

Playwright + TypeScript framework for automated UI testing of CBX Cloud on the
OI UAT environment (`https://oi-uat.tradebeyond.com`).

The framework is built and ready; the e2e use cases get filled in once they're
shared. The structure uses the Page Object Model, a one-time login that is
reused across tests, and environment-based configuration.

## Prerequisites

- Node.js 18+ (built/tested on Node 22)
- Network access to the OI UAT environment from the machine running the tests

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install Playwright browsers
npm run install:browsers

# 3. Configure credentials + base URL
cp .env.example .env
#   then edit .env and set CBX_USERNAME / CBX_PASSWORD
```

## Running

```bash
# Connectivity smoke tests — no login needed. Run this FIRST to confirm
# the UAT env is reachable and the base URL is correct.
npm run test:smoke

# Full authenticated e2e suite (logs in once, then runs the use cases)
npm run test:e2e

# Everything
npm test

# Useful modes
npm run test:headed   # watch the browser
npm run test:ui       # Playwright's interactive UI runner
npm run test:debug    # step-through debugging
npm run report        # open the last HTML report
```

## Capturing real selectors

The login/dashboard selectors are best-guess placeholders marked with `TODO`
in `pages/`. Confirm them against the live site using Playwright's recorder,
which writes resilient locators for you:

```bash
npm run codegen
```

Paste the captured locators into the relevant Page Object.

## Project structure

```
cbx-playwright/
├── playwright.config.ts      # Config: base URL, projects, reporters, retries
├── tsconfig.json             # TypeScript + path aliases (@pages, @utils, ...)
├── .env.example              # Copy to .env and fill in credentials
│
├── tests/
│   ├── auth.setup.ts         # Logs in once, saves session for reuse
│   ├── smoke/                # No-auth reachability checks
│   │   └── connectivity.spec.ts
│   └── e2e/                  # Authenticated use cases (your tests go here)
│       └── example.spec.ts
│
├── pages/                    # Page Object Model
│   ├── BasePage.ts
│   ├── LoginPage.ts          # TODO: confirm selectors
│   └── DashboardPage.ts      # TODO: confirm "logged-in" signal
│
├── fixtures/
│   └── test-fixtures.ts      # Exposes page objects to tests
│
├── utils/
│   └── config.ts             # Typed env access with fail-fast validation
│
└── data/
    └── test-data.json        # Externalized test data
```

## How login is handled

`tests/auth.setup.ts` runs once before the e2e suite, logs in with the `.env`
credentials, and saves the authenticated browser state to
`fixtures/.auth/user.json`. The `chromium` project loads that state, so every
e2e test starts already logged in — no repeated login UI, much faster, less
flaky. (The `smoke` project deliberately skips this so you can test
connectivity before credentials are set up.)

## Adding your use cases

Each use case becomes a `test(...)` (or a `test.describe(...)` group) under
`tests/e2e/`, driving Page Objects in `pages/`. Add a new Page Object per
screen/module, expose it in `fixtures/test-fixtures.ts` if you want it injected
automatically, and keep data in `data/`. Send the use cases over and they'll be
wired in following this pattern.

## CI

A sample GitHub Actions workflow is in `.github/workflows/playwright.yml`.
JUnit results are written to `test-results/junit.xml` and the HTML report to
`playwright-report/`. Provide `CBX_USERNAME` / `CBX_PASSWORD` (and `BASE_URL`
if different) as CI secrets, and ensure the runner can reach the UAT network.
