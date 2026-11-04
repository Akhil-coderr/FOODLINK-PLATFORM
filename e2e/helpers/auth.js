const { expect } = require('@playwright/test');

/**
 * Authentication Helpers for FoodLink Playwright E2E Tests
 */

async function loginAsRole(page, email, password, targetDashboard) {
  await page.goto('/login');
  await page.waitForLoadState('domcontentloaded');

  // Check if we are already logged in to the target dashboard
  try {
    if (page.url().includes(targetDashboard)) return;
  } catch (e) {
    // continue
  }

  // If currently on any other dashboard or route, clear auth storage and re-navigate
  if (!page.url().includes('/login')) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');
  }

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(new RegExp(targetDashboard), { timeout: 10000 });
}

async function loginAsDonor(page) {
  return loginAsRole(page, 'donor@grandresidency.com', 'Donor@123', '/donor/dashboard');
}

async function loginAsNGO(page) {
  return loginAsRole(page, 'contact@hopeshelter.org', 'Ngo@123', '/ngo/dashboard');
}

async function loginAsVolunteer(page) {
  return loginAsRole(page, 'volunteer@foodlink.org', 'Volunteer@123', '/volunteer/dashboard');
}

async function loginAsAdmin(page) {
  await page.goto('/admin/login');
  await page.waitForLoadState('domcontentloaded');

  try {
    if (page.url().includes('/admin/dashboard')) return;
  } catch (e) {
    // continue
  }

  if (!page.url().includes('/admin/login')) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
  }

  const emailInput = page.locator('input[type="email"]');
  await emailInput.waitFor({ state: 'visible', timeout: 5000 });
  await emailInput.fill('admin@foodlink.org');
  await page.locator('input[type="password"]').fill('Admin@123');
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/.*\/admin\/dashboard/, { timeout: 10000 });
}

module.exports = {
  loginAsDonor,
  loginAsNGO,
  loginAsVolunteer,
  loginAsAdmin,
};
