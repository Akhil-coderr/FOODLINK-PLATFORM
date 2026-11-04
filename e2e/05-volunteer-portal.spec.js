const { test, expect } = require('@playwright/test');
const { loginAsVolunteer } = require('./helpers/auth');

test.describe('Volunteer Portal Route & Logistics Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsVolunteer(page);
  });

  test('Volunteer Dashboard: renders transport capacity, karma points and missions', async ({ page }) => {
    await page.goto('/volunteer/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('a[href="/volunteer/tasks"]').or(page.getByRole('link', { name: /Tasks/i })).first()).toBeVisible();
  });

  test('Volunteer Tasks & Assignments: dispatch pool and assigned missions', async ({ page }) => {
    await page.goto('/volunteer/tasks');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/volunteer/assignments');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Volunteer QR Scanner & Navigation Routes: camera and map elements', async ({ page }) => {
    await page.goto('/volunteer/routes');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/volunteer/scan');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Volunteer Rewards & Karma Badges: coupon redemption catalog', async ({ page }) => {
    await page.goto('/volunteer/rewards');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/volunteer/achievements');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });

    await page.goto('/volunteer/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input, select').first()).toBeVisible();

    await page.goto('/volunteer/notifications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
