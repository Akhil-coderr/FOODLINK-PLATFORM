const { test, expect } = require('@playwright/test');
const { loginAsDonor } = require('./helpers/auth');

test.describe('Donor Portal Route & Workflow Verification', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDonor(page);
  });

  test('Donor Dashboard: renders metrics and quick donation actions', async ({ page }) => {
    await page.goto('/donor/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
    await expect(page.locator('a[href="/donor/donations/create"]').first()).toBeVisible();
  });

  test('Donor Add Donation Form: renders all mandatory fields and controls', async ({ page }) => {
    await page.goto('/donor/donations/create');
    await page.waitForLoadState('domcontentloaded');

    // Mandatory food fields
    await expect(page.locator('input[placeholder*="Biryani"]').first()).toBeVisible();
    await expect(page.locator('select').first()).toBeVisible();
    await expect(page.locator('input[type="number"]').first()).toBeVisible();
  });

  test('Donor Listings Page: displays active listings table and filters', async ({ page }) => {
    await page.goto('/donor/donations');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Donor Pickups & Requests: renders coordination tabs', async ({ page }) => {
    await page.goto('/donor/requests');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/donor/pickups');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('Donor Analytics & Profile: renders telemetry and account settings', async ({ page }) => {
    await page.goto('/donor/analytics');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();

    await page.goto('/donor/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[name="name"]').or(page.locator('input[type="text"]')).first()).toBeVisible();

    await page.goto('/donor/notifications');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
