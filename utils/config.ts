import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Centralized, typed access to environment configuration.
 * Throws early with a clear message if a required value is missing,
 * so tests fail fast instead of with a cryptic null reference later.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Copy .env.example to .env and fill it in.`
    );
  }
  return value;
}

export const config = {
  baseUrl: process.env.BASE_URL ?? 'https://oi-uat.tradebeyond.com',

  // Credentials are only read when login actually runs, so reference
  // them lazily through getters to avoid throwing during simple smoke runs.
  get username(): string {
    return required('CBX_USERNAME');
  },
  get password(): string {
    return required('CBX_PASSWORD');
  },

  // Where the authenticated browser state is persisted.
  authFile: 'fixtures/.auth/user.json',
} as const;
