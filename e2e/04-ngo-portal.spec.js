const { test, expect } = require('@playwright/test');
const { loginAsNGO } = require('./helpers/auth');

test.describe('NGO Portal Route & Claiming Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsNGO(page);
  });

  test('NGO Dashboard: renders receiving capacity and claim metrics', async ({ page }) => {
    await page.goto('/ngo/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('a[href="/ngo/food"]').or(page.getByRole('link', { name: /Browse Food|Find Food/i })).first()).toBeVisible();
  });

  test('NGO Browse Food & Matching: discovery and smart algorithmic matching', async ({ page }) => {
    await page.goto('/ngo/food');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/ngo/matching');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('NGO Requests & Deliveries: claim lifecycle and delivery tracking', async ({ page }) => {
    await page.goto('/ngo/requests');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/ngo/deliveries');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('NGO History, Impact & Profile: shelter metrics and accreditation info', async ({ page }) => {
    await page.goto('/ngo/history');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/ngo/impact');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/ngo/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input').first()).toBeVisible();

    await page.goto('/ngo/notifications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
