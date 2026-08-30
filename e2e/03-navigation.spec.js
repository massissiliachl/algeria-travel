import { test, expect } from '@playwright/test';
import { preparePage } from './helpers';

/** Liens principaux de la navbar desktop */
const NAV_LINKS = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/activities', label: 'Activités' },
  { href: '/hotels', label: 'Hôtels' },
  { href: '/tours', label: 'Circuits' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

test.describe('Navigation navbar', () => {
  test.beforeEach(async ({ page }) => {
    await preparePage(page);
    await page.goto('/');
    await page.waitForSelector('nav', { timeout: 15000 });
  });

  for (const link of NAV_LINKS) {
    test(`Menu → ${link.label}`, async ({ page }) => {
      const navLink = page.locator(`nav a[href="${link.href}"]`).first();
      await expect(navLink).toBeVisible();
      await navLink.click();
      await page.waitForURL(`**${link.href}`, { timeout: 10000 });
      expect(page.url()).toContain(link.href);
    });
  }
});
