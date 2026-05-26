const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log(`[Browser Console]: ${msg.text()}`));
  page.on('pageerror', error => console.error(`[Browser Error]: ${error.message}`));

  try {
    await page.goto('http://localhost:3000/admin/database/rate-card/quotation', { waitUntil: 'networkidle' });
    console.log('Page loaded successfully.');
  } catch (err) {
    console.error('Failed to load page:', err);
  } finally {
    await browser.close();
  }
})();
