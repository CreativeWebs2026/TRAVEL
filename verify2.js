const { chromium } = require("playwright-chromium");

async function run(viewport, prefix) {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text()); });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  await page.screenshot({ path: `shots/${prefix}-01-home.png` });
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `shots/${prefix}-01b-home-scrolled.png` });
  await page.evaluate(() => window.scrollTo(0, 0));

  await page.click(".popular-card >> nth=1"); // Rome (photo already cached/working)
  await page.waitForSelector("#screen-plan.active");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `shots/${prefix}-02-plan.png` });

  await page.click('.interest-chip[data-id="culture"]');
  await page.click("#generateBtn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `shots/${prefix}-03-itinerary.png` });

  await page.click("#budgetFab");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `shots/${prefix}-04-budget.png` });

  console.log(`=== ${prefix} ERRORS ===`);
  console.log(errors.length ? errors.join("\n") : "none");

  await browser.close();
}

(async () => {
  await run({ width: 390, height: 844 }, "mobile");
  await run({ width: 1440, height: 900 }, "desktop");
})().catch((e) => { console.error("SCRIPT FAILED:", e); process.exit(1); });
