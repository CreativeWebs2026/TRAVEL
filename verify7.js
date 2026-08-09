const { chromium } = require("playwright-chromium");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text()); });

  await page.goto("https://creativewebs2026.github.io/TRAVEL/", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  await page.screenshot({ path: "shots/live-01-home.png" });

  const box = await page.locator("#myTripsBtn").boundingBox();
  console.log("myTripsBtn boundingBox:", JSON.stringify(box));
  const chipBox = await page.locator("#profileChip").boundingBox();
  console.log("profileChip boundingBox:", JSON.stringify(chipBox));

  // element actually at that top-right point?
  const elAtPoint = await page.evaluate(({x,y}) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.outerHTML.slice(0, 200) : "NONE";
  }, { x: box.x + box.width/2, y: box.y + box.height/2 });
  console.log("element at myTripsBtn center point:", elAtPoint);

  await page.click("#myTripsBtn", { timeout: 5000 }).then(
    () => console.log("myTripsBtn click: OK"),
    (e) => console.log("myTripsBtn click FAILED:", e.message)
  );
  await page.waitForTimeout(500);
  console.log("active screen after click:", await page.evaluate(() => document.querySelector(".screen.active").id));
  await page.screenshot({ path: "shots/live-02-after-mytrips-click.png" });

  // go back home, generate a trip, check itinerary screen's top-right buttons
  await page.click('.screen.active [data-back="home"]');
  await page.waitForSelector("#screen-home.active");
  await page.click(".popular-card >> nth=0");
  await page.waitForSelector("#screen-plan.active");
  await page.click("#generateBtn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(400);
  await page.screenshot({ path: "shots/live-03-itinerary-header.png" });

  const tipsBox = await page.locator("#tipsBtn").boundingBox();
  const saveBox = await page.locator("#saveTripBtn").boundingBox();
  console.log("tipsBtn box:", JSON.stringify(tipsBox));
  console.log("saveTripBtn box:", JSON.stringify(saveBox));
  const elAtTips = await page.evaluate(({x,y}) => {
    const el = document.elementFromPoint(x, y);
    return el ? el.id || el.className : "NONE";
  }, { x: tipsBox.x + tipsBox.width/2, y: tipsBox.y + tipsBox.height/2 });
  console.log("element at tipsBtn center:", elAtTips);

  await page.click("#tipsBtn", { timeout: 5000 }).then(
    () => console.log("tipsBtn click: OK"),
    (e) => console.log("tipsBtn click FAILED:", e.message)
  );
  await page.waitForTimeout(400);
  console.log("tips sheet shown:", await page.evaluate(() => document.getElementById("tipsSheet").classList.contains("show")));
  await page.screenshot({ path: "shots/live-04-tips-sheet.png" });
  await page.click('#tipsSheet .sheet-close');
  await page.waitForTimeout(300);

  await page.click("#saveTripBtn", { timeout: 5000 }).then(
    () => console.log("saveTripBtn click: OK"),
    (e) => console.log("saveTripBtn click FAILED:", e.message)
  );
  await page.waitForTimeout(300);
  console.log("heart after click:", await page.textContent("#saveTripBtn"));

  // My Trips screen edit-profile button
  await page.click('.screen.active [data-back="plan"]');
  await page.click('.screen.active [data-back="home"]');
  await page.waitForSelector("#screen-home.active");
  await page.click("#myTripsBtn");
  await page.waitForSelector("#screen-mytrips.active");
  await page.click("#editProfileBtn", { timeout: 5000 }).then(
    () => console.log("editProfileBtn click: OK"),
    (e) => console.log("editProfileBtn click FAILED:", e.message)
  );
  await page.waitForTimeout(300);
  console.log("profile sheet shown:", await page.evaluate(() => document.getElementById("profileSheet").classList.contains("show")));

  console.log("=== ERRORS ===");
  console.log(errors.length ? errors.join("\n") : "none");
  await browser.close();
})().catch((e) => { console.error("SCRIPT FAILED:", e); process.exit(1); });
