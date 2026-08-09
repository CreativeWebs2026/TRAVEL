const { chromium } = require("playwright-chromium");

(async () => {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push("CONSOLE: " + msg.text()); });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  console.log("profile chip text:", await page.textContent("#profileChip"));
  await page.screenshot({ path: "shots/trips-01-home.png" });

  // generate a trip for Rome (2nd popular card)
  await page.click(".popular-card >> nth=1");
  await page.waitForSelector("#screen-plan.active");
  await page.click("#generateBtn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(400);

  // save it
  const heartBefore = await page.textContent("#saveTripBtn");
  console.log("heart before save:", heartBefore);
  await page.click("#saveTripBtn");
  await page.waitForTimeout(300);
  const heartAfter = await page.textContent("#saveTripBtn");
  console.log("heart after save:", heartAfter);
  await page.screenshot({ path: "shots/trips-02-saved-itinerary.png" });

  // go home, then to My Trips
  await page.click('[data-back="plan"]'); // back to plan
  await page.click('[data-back="home"]'); // back to home
  await page.waitForSelector("#screen-home.active");
  const badge = await page.$(".trip-count-badge");
  console.log("trip count badge present:", !!badge, badge ? await badge.textContent() : "");
  await page.click("#myTripsBtn");
  await page.waitForSelector("#screen-mytrips.active");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/trips-03-mytrips-list.png" });

  // open the saved trip
  await page.click(".trip-open-btn");
  await page.waitForSelector("#screen-itinerary.active");
  await page.waitForTimeout(400);
  console.log("reopened heart state:", await page.textContent("#saveTripBtn"));
  await page.screenshot({ path: "shots/trips-04-reopened.png" });

  // edit profile (must go back to home first, profileChip lives there)
  await page.click('[data-back="plan"]');
  await page.click('[data-back="home"]');
  await page.waitForSelector("#screen-home.active");
  await page.click("#profileChip");
  await page.waitForSelector("#profileSheet.show");
  await page.fill("#profileNameInput", "Ana");
  await page.click('.avatar-option[data-avatar="🌍"]');
  await page.click("#saveProfileBtn");
  await page.waitForTimeout(300);
  console.log("profile chip after edit:", await page.textContent("#profileChip"));
  await page.screenshot({ path: "shots/trips-05-profile-edited.png" });

  // reload page — confirm persistence
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector("text=TravelAI");
  console.log("profile chip after reload:", await page.textContent("#profileChip"));
  const badge2 = await page.$(".trip-count-badge");
  console.log("trip badge after reload:", badge2 ? await badge2.textContent() : "none");

  // delete the trip
  await page.click("#myTripsBtn");
  await page.waitForSelector("#screen-mytrips.active");
  await page.click(".trip-delete-btn");
  await page.waitForTimeout(300);
  await page.screenshot({ path: "shots/trips-06-after-delete.png" });

  console.log("=== ERRORS ===");
  console.log(errors.length ? errors.join("\n") : "none");
  await browser.close();
})().catch((e) => { console.error("SCRIPT FAILED:", e); process.exit(1); });
