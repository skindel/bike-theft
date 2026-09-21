// Optional visual smoke check against a running local server.
// Run: node scripts/preview-check.mjs. Screenshots go to /tmp/bikewatch-preview.
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
await mkdir('/tmp/bikewatch-preview', { recursive: true });
const browser = await chromium.launch();
const errors = [];
for (const [name, viewport] of Object.entries({
  desktop: { width: 1440, height: 1050 },
  mobile: { width: 390, height: 844 },
})) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => errors.push(error.message));
  for (const route of ['map', 'reports', 'community']) {
    await page.goto(`http://127.0.0.1:3000/${route}`);
    await page.waitForTimeout(route === 'map' ? 6000 : 300);
    await page.screenshot({ path: `/tmp/bikewatch-preview/${name}-${route}.png`, fullPage: true });
    console.log(name, route, {
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      mapStatus: route === 'map' ? await page.locator('.map-status').allTextContents() : undefined,
    });
  }
  await page.close();
}
await browser.close();
console.log('Browser errors:', errors);
if (errors.length) process.exitCode = 1;
