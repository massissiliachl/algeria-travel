import { test, expect } from '@playwright/test';
import { DETAIL_PAGES, REDIRECT_PAGES } from './site-pages';
import { preparePage, visitAndAssert } from './helpers';

test.describe('Pages détail', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const entry of DETAIL_PAGES) {
    test(`${entry.name} — ${entry.path}`, async ({ page }) => {
      await visitAndAssert(page, entry);
    });
  }
});

test.describe('Redirections', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
  });

  for (const entry of REDIRECT_PAGES) {
    test(`${entry.path} → ${entry.expectPath}`, async ({ page }) => {
      await page.goto(entry.path);
      await page.waitForURL(`**${entry.expectPath}`, { timeout: 10000 });
      expect(page.url()).toContain(entry.expectPath);
    });
  }
});
