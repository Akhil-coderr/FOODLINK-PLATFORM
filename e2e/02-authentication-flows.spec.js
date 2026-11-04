const { test, expect } = require('@playwright/test');

test.describe('Authentication & User Role Gateways', () => {
  test('Standard Login: renders inputs and handles invalid credentials with toast notification', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    // Verify form elements
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Submit invalid credentials
    await emailInput.fill('nonexistent@foodlink.org');
    await passwordInput.fill('WrongPassword@999');
    await submitBtn.click();

    // Check that error feedback toast or error text appears
    const notification = page.locator('text=Invalid email or password').or(page.locator('aside[role="region"]')).or(page.locator('text=Attention Required'));
    await expect(notification.first()).toBeVisible({ timeout: 6000 });
  });

  test('Donor Login: successfully signs in and redirects to /donor/dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill('donor@grandresidency.com');
    await page.locator('input[type="password"]').fill('Donor@123');
    await page.locator('button[type="submit"]').click();

    // Verify redirection to donor dashboard
    await expect(page).toHaveURL(/.*\/donor\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2, nav').first()).toBeVisible();
  });

  test('NGO Login: successfully signs in and redirects to /ngo/dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill('contact@hopeshelter.org');
    await page.locator('input[type="password"]').fill('Ngo@123');
    await page.locator('button[type="submit"]').click();

    // Verify redirection to NGO dashboard
    await expect(page).toHaveURL(/.*\/ngo\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2, nav').first()).toBeVisible();
  });

  test('Volunteer Login: successfully signs in and redirects to /volunteer/dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    await page.locator('input[type="email"]').fill('volunteer@foodlink.org');
    await page.locator('input[type="password"]').fill('Volunteer@123');
    await page.locator('button[type="submit"]').click();

    // Verify redirection to Volunteer dashboard
    await expect(page).toHaveURL(/.*\/volunteer\/dashboard/, { timeout: 10000 });
    await expect(page.locator('h1, h2, nav').first()).toBeVisible();
  });

  test('Admin Login Portal: dedicated interface and admin authorization', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');

    // Verify dedicated admin heading
    const adminHeading = page.locator('h2:has-text("Administrator Sign In")');
    await expect(adminHeading).toBeVisible();

    const adminEmail = page.locator('input[type="email"]');
    const adminPass = page.locator('input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    await expect(adminEmail).toBeVisible();
    await expect(adminPass).toBeVisible();

    // Submit correct admin credentials
    await adminEmail.fill('admin@foodlink.org');
    await adminPass.fill('Admin@123');
    await submitBtn.click();

    // Verify redirect to admin control center
    await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Platform Governance').or(page.locator('text=Control Center')).or(page.locator('h1')).first()).toBeVisible();
  });

  test('Registration Gateway & Dedicated Role Forms render validation', async ({ page }) => {
    // 1. Gateway
    await page.goto('/register');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: /Select Your Participation Role/i })).toBeVisible();
    await expect(page.locator('text=Food Donor')).toBeVisible();
    await expect(page.locator('text=NGO / Charity Shelter')).toBeVisible();
    await expect(page.locator('text=Community Volunteer')).toBeVisible();

    // 2. Donor Register
    await page.goto('/register/donor');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 3. NGO Register
    await page.goto('/register/ngo');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 4. Volunteer Register
    await page.goto('/register/volunteer');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 5. Password Reset Request
    await page.goto('/forgot-password');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
