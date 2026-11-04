const { test, expect } = require('@playwright/test');
const { loginAsAdmin } = require('./helpers/auth');

test.describe('Admin Control Center Route & Governance Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Admin Dashboard: renders governance control center and system telemetry', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.getByText(/Total Users|Total Food|Verified NGOs|System/i).first()).toBeVisible();
  });

  test('Admin User & Role Directories: users, donors, ngos, volunteers', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/donors');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/ngos');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/volunteers');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Admin Operations Oversight: donations, requests, assignments, food safety', async ({ page }) => {
    await page.goto('/admin/donations');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/requests');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/assignments');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/food-safety');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Admin Telemetry, Reports, Security & Rewards: analytics, reports, settings, audit logs, rewards', async ({ page }) => {
    await page.goto('/admin/analytics');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/reports');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/settings');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/audit-logs');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/rewards');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/redemptions');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/admin/messages');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
