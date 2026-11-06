const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://foodlink-platform.onrender.com';
const OUT_DIR = path.resolve(__dirname, '../FOODLINK_Screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function captureScreenshots() {
  console.log('🚀 Starting automated Playwright screenshot capture from:', BASE_URL);
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  // 1. Landing Page
  console.log('Capturing Figure 6.1 Landing Page...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_1_Landing_Page.png'), fullPage: false });

  // 2. Register Page
  console.log('Capturing Figure 6.2 Registration Page...');
  await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_2_Registration_Page.png') });

  // 3. Login Page
  console.log('Capturing Figure 6.3 Login Page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_3_Login_Page.png') });

  // 6. Available Food Page
  console.log('Capturing Figure 6.6 Available Food Catalog...');
  await page.goto(`${BASE_URL}/food`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_6_Available_Food_Catalog.png') });

  // 4. Donor Dashboard & 5. Food Donation Form (Log in as donor)
  console.log('Logging in as Donor...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'donor@grandresidency.com');
  await page.fill('input[type="password"]', 'Donor@123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('Capturing Figure 6.4 Donor Dashboard...');
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_4_Donor_Dashboard.png') });

  console.log('Capturing Figure 6.5 Food Donation Form...');
  await page.goto(`${BASE_URL}/donor/donations/create`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_5_Food_Donation_Form.png') });

  // Clear cookies/storage for next user
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  // 7. NGO Dashboard & 8. Donation Claiming (Log in as NGO)
  console.log('Logging in as NGO...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'contact@hopeshelter.org');
  await page.fill('input[type="password"]', 'Ngo@123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('Capturing Figure 6.7 NGO Dashboard...');
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_7_NGO_Dashboard.png') });

  console.log('Capturing Figure 6.8 Donation Claiming Interface...');
  await page.goto(`${BASE_URL}/ngo/browse`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_8_Donation_Claiming_Interface.png') });

  // Clear cookies/storage for next user
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  // 9. Volunteer Dashboard, 10. Pickup Management, 11. Rewards, 12. Achievements
  console.log('Logging in as Volunteer...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'arun.volunteer@foodlink.org');
  await page.fill('input[type="password"]', 'Volunteer@123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('Capturing Figure 6.9 Volunteer Dashboard...');
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_9_Volunteer_Dashboard.png') });

  console.log('Capturing Figure 6.10 Pickup Management...');
  await page.goto(`${BASE_URL}/volunteer/assignments`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_10_Pickup_Management.png') });

  console.log('Capturing Figure 6.11 Volunteer Rewards Page...');
  await page.goto(`${BASE_URL}/volunteer/rewards`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_11_Rewards_Page.png') });

  console.log('Capturing Figure 6.12 Volunteer Achievements Page...');
  await page.goto(`${BASE_URL}/volunteer/achievements`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_12_Achievements_Redemption.png') });

  // Clear cookies/storage for next user
  await context.clearCookies();
  await page.evaluate(() => localStorage.clear());

  // 13. Admin Dashboard & 14. Admin Management (Log in as Admin)
  console.log('Logging in as Admin...');
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('input[type="email"]', 'admin@foodlink.org');
  await page.fill('input[type="password"]', 'Admin@123');
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(3000);

  console.log('Capturing Figure 6.13 Admin Dashboard...');
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_13_Admin_Dashboard.png') });

  console.log('Capturing Figure 6.14 Admin Management...');
  await page.goto(`${BASE_URL}/admin/donations`, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT_DIR, 'Figure_6_14_Admin_Management.png') });

  // 15. Responsive Mobile View (iPhone 13 viewport 390x844)
  console.log('Capturing Figure 6.15 Responsive Mobile View...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle', timeout: 30000 });
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: path.join(OUT_DIR, 'Figure_6_15_Responsive_Mobile_View.png') });
  await mobileContext.close();

  await browser.close();
  console.log('✅ All 15 genuine application screenshots captured successfully in:', OUT_DIR);
}

captureScreenshots().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
