const { test, expect } = require('@playwright/test');
const { loginAsVolunteer, loginAsNGO } = require('./helpers/auth');

test.describe('Role-Based Access Control (RBAC) & Route Protection', () => {
  test('Unauthenticated user is denied access to /donor/* and redirected to /login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/donor/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated user is denied access to /ngo/* and redirected to /login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/ngo/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated user is denied access to /volunteer/* and redirected to /login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/volunteer/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Unauthenticated user is denied access to /admin/* and redirected to /admin/login', async ({ page }) => {
    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });

  test('Cross-Role Protection: Volunteer cannot access donor creation page (/donor/donations/create)', async ({ page }) => {
    await loginAsVolunteer(page);

    // Try navigating to a donor-only route
    await page.goto('/donor/donations/create');
    await page.waitForLoadState('domcontentloaded');

    // Should be redirected to /unauthorized
    await expect(page).toHaveURL(/.*\/unauthorized/);
    await expect(page.getByText(/Access Restricted|Unauthorized|Access Denied/i).first()).toBeVisible();
  });

  test('Cross-Role Protection: NGO cannot access administrator dashboard (/admin/dashboard)', async ({ page }) => {
    await loginAsNGO(page);

    // Try navigating to admin control center
    await page.goto('/admin/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Should be redirected to /unauthorized or /admin/login
    await expect(page).toHaveURL(/.*(\/unauthorized|\/admin\/login)/, { timeout: 10000 });
  });
});
