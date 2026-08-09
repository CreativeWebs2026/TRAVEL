const { chromium } = require("playwright-chromium");

async function run(viewport, prefix) {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.stack || e.message));
  page.on("console", (msg) => errors.push(`CONSOLE[${msg.type()}]: ` + msg.text()));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  await page.screenshot({ path: `shots/${prefix}-fullbg-home.png` });

  // type a NON-curated place and use the "search worldwide" flow
  await page.fill("#destInput", "Lisbon");
  await page.waitForSelector(".suggestion-world");
  await page.screenshot({ path: `shots/${prefix}-worldsuggest.png` });
  await page.click(".suggestion-world");

  // wait for either the plan screen to appear, or an error message
  try {
    await Promise.race([
      page.waitForSelector("#screen-plan.active", { timeout: 15000 }),
      page.waitForSelector(".suggestion-error", { timeout: 15000 }),
    ]);
  } catch (e) {
    console.log(`${prefix}: TIMED OUT — inspecting state...`);
    const debug = await page.evaluate(() => {
      return {
        planActive: document.getElementById("screen-plan").className,
        destName: typeof state !== "undefined" && state.destination ? state.destination.name : null,
        boxHtml: document.getElementById("searchSuggestions").innerHTML.slice(0, 300),
      };
    });
    console.log(`${prefix}: DEBUG`, JSON.stringify(debug));
  }
  const gotError = await page.$(".suggestion-error");
  if (gotError) {
    console.log(`${prefix}: GLOBAL SEARCH ERROR:`, await gotError.textContent());
  } else {
    await page.waitForTimeout(500);
    await page.screenshot({ path: `shots/${prefix}-world-plan.png` });
    await page.click("#generateBtn");
    await page.waitForSelector("#screen-itinerary.active");
    await page.waitForTimeout(800);
    await page.screenshot({ path: `shots/${prefix}-world-itinerary.png` });
  }

  console.log(`=== ${prefix} ERRORS ===`);
  console.log(errors.length ? errors.join("\n") : "none");

  await browser.close();
}

(async () => {
  await run({ width: 1440, height: 900 }, "desktop");
  await run({ width: 390, height: 844 }, "mobile");
})().catch((e) => { console.error("SCRIPT FAILED:", e); process.exit(1); });
