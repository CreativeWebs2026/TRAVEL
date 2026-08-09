const { chromium } = require("playwright-chromium");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");

  await page.click(".popular-card >> nth=0");
  await page.waitForSelector("#screen-plan.active");
  await page.click("#generateBtn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(400);
  await page.click("#saveTripBtn");
  await page.waitForTimeout(300);

  await page.click('[data-back="plan"]');
  await page.click('[data-back="home"]');
  await page.click("#myTripsBtn");
  await page.waitForSelector("#screen-mytrips.active");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/trips-desktop-mytrips.png" });

  await page.click("#editProfileBtn");
  await page.waitForSelector("#profileSheet.show");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/trips-desktop-profile-sheet.png" });

  await browser.close();
})();
