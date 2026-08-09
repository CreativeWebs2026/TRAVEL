const { chromium } = require("playwright-chromium");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text()); });
  page.on("requestfailed", (req) => errors.push("REQFAIL: " + req.url() + " (" + (req.failure() && req.failure().errorText) + ")"));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  await page.screenshot({ path: "shots/01-home.png" });

  // click first popular destination card
  await page.click(".popular-card >> nth=0");
  await page.waitForSelector("#screen-plan.active");
  await page.waitForTimeout(600);
  await page.screenshot({ path: "shots/02-plan.png" });

  // bump days, pick a couple interests, generate
  await page.click('#daysStepper button[data-step="1"]');
  await page.click('#daysStepper button[data-step="1"]');
  await page.click('.interest-chip[data-id="nature"]');
  await page.click('.interest-chip[data-id="photography"]');
  await page.click("#generateBtn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(800);
  await page.screenshot({ path: "shots/03-itinerary.png" });

  // switch weather + day tab
  await page.click('.weather-chip[data-w="rainy"]');
  await page.waitForTimeout(300);
  const day2 = await page.$('.day-tab[data-day="2"]');
  if (day2) await day2.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/04-itinerary-day2-rainy.png" });

  // open budget sheet
  await page.click("#budgetFab");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/05-budget-sheet.png" });
  await page.click("#budgetSheet .sheet-close");
  await page.waitForTimeout(400);

  // open safety tips sheet
  await page.click("#tipsBtn");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/06-tips-sheet.png" });

  // check broken images
  const brokenImages = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img"))
      .filter((img) => !img.complete || img.naturalWidth === 0)
      .map((img) => img.src);
  });

  console.log("=== ERRORS ===");
  console.log(errors.length ? errors.join("\n") : "none");
  console.log("=== BROKEN IMAGES ===");
  console.log(brokenImages.length ? brokenImages.join("\n") : "none");

  await browser.close();
})().catch((e) => { console.error("SCRIPT FAILED:", e); process.exit(1); });
