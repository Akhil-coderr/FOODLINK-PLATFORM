const { test, expect } = require('@playwright/test');

test.describe('Public Pages & Responsive Layout Validation', () => {
  const publicRoutes = [
    { path: '/', titleSnippet: 'FoodLink', expectedHeading: /Rescue Food|FoodLink/i },
    { path: '/food', titleSnippet: 'FoodLink', expectedHeading: /Available Surplus Food Listings/i },
    { path: '/how-it-works', titleSnippet: 'FoodLink', expectedHeading: /How FoodLink Connects Supply to Need/i },
    { path: '/impact', titleSnippet: 'FoodLink', expectedHeading: /FoodLink Public Impact Dashboard/i },
    { path: '/about', titleSnippet: 'FoodLink', expectedHeading: /Empowering Communities to End Food Waste/i },
    { path: '/contact', titleSnippet: 'FoodLink', expectedHeading: /Contact the FoodLink Team/i },
    { path: '/partners', titleSnippet: 'FoodLink', expectedHeading: /Our Verified Partners|Partners/i },
    { path: '/unauthorized', titleSnippet: 'FoodLink', expectedHeading: /Access Restricted|Unauthorized/i },
  ];

  for (const route of publicRoutes) {
    test(`renders public route ${route.path} cleanly with zero console crashes`, async ({ page }) => {
      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto(route.path);
      await page.waitForLoadState('domcontentloaded');

      // Verify no React Error Boundary was triggered
      const errorBoundaryText = await page.locator('text=Something went wrong').count();
      expect(errorBoundaryText).toBe(0);

      // Verify main heading exists
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(route.expectedHeading);

      // Filter out benign browser warnings (e.g., third-party font/image CDN or socket fallback)
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes('favicon.ico') &&
          !err.includes('Socket.IO') &&
          !err.includes('websocket') &&
          !err.includes('status of 404')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test('Available Food Page: search input and filters function properly', async ({ page }) => {
    await page.goto('/food');
    await page.waitForLoadState('domcontentloaded');

    // Check search input presence
    const searchInput = page.locator('input[placeholder*="Search by food dish"]');
    await expect(searchInput).toBeVisible();

    // Type query
    await searchInput.fill('Rice');
    const searchBtn = page.locator('button:has-text("Search")');
    await searchBtn.click();
    await page.waitForTimeout(400);

    // Verify category select is present
    const categorySelect = page.locator('select').first();
    await expect(categorySelect).toBeVisible();

    // Select category
    await categorySelect.selectOption({ index: 1 });
    await page.waitForTimeout(300);

    // Verify distance sorting button exists
    const distanceBtn = page.locator('button:has-text("Sort by Distance"), button:has-text("Location Active")');
    await expect(distanceBtn).toBeVisible();
  });

  test('Public Impact Page: verifies charts and metrics render', async ({ page }) => {
    await page.goto('/impact');
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    const heading = page.locator('h1:has-text("Public Impact Dashboard")');
    await expect(heading).toBeVisible();

    // Check Bar Chart container
    const chartHeading = page.locator('text=Monthly Food Rescue Growth');
    await expect(chartHeading).toBeVisible();

    // Check Donut Chart container
    const categoryHeading = page.locator('text=Food Category Breakdown');
    await expect(categoryHeading).toBeVisible();

    // Check category pills
    const thaliPill = page.locator('text=Cooked Meals & Thalis');
    await expect(thaliPill).toBeVisible();
  });

  test('Navigation & Header Links navigate smoothly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const isSmallScreen = (page.viewportSize()?.width || 1200) < 768;
    if (isSmallScreen) {
      // Open mobile drawer
      const hamburger = page.locator('.flex.md\\:hidden button');
      await hamburger.click();
      await page.waitForTimeout(300);

      // Click "How It Works" in mobile drawer
      const howItWorksMobile = page.locator('div.md\\:hidden a:has-text("How It Works")');
      await howItWorksMobile.click();
      await expect(page).toHaveURL(/.*\/how-it-works/);
    } else {
      // Click "How It Works" in desktop navbar
      const howItWorksLink = page.locator('nav a:has-text("How It Works")').first();
      await howItWorksLink.click();
      await expect(page).toHaveURL(/.*\/how-it-works/);

      // Click "Available Food" in desktop navbar
      const foodLink = page.locator('nav a:has-text("Available Food")').first();
      await foodLink.click();
      await expect(page).toHaveURL(/.*\/food/);
    }
  });
});
