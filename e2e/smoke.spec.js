const { test, expect } = require('@playwright/test');

test('Playwright environment and Chrome launcher verification', async ({ page }) => {
  await page.setContent('<html><body><h1>FoodLink E2E Verification</h1></body></html>');
  const heading = await page.textContent('h1');
  expect(heading).toBe('FoodLink E2E Verification');
});
