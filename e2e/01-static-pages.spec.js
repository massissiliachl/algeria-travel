import { test, expect } from '@playwright/test';
import { STATIC_PAGES } from './site-pages';
import { preparePage, visitAndAssert } from './helpers';

test.describe('Pages statiques', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const entry of STATIC_PAGES) {
    test(`${entry.name} — ${entry.path}`, async ({ page }) => {
      const { title } = await visitAndAssert(page, entry);
      expect(title.toLowerCase()).not.toContain('error');
    });
  }
});
