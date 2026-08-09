const { chromium } = require("playwright-chromium");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  await page.screenshot({ path: "shots/fullbleed-1920.png" });
  await browser.close();
})();
