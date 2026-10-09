/** Start the car, crash, then save the score with the test Gmail. */
export default async ({ page, url }) => {
  await page.goto(url(), { waitUntil: "domcontentloaded" });
  const score = page.locator("#score");
  await score.waitFor();
  const results = page.locator("#results");

  // "Press UP" is in the HTML before Firebase init sets ready. Press until
  // the score becomes 0, which is startGame(), then hold accelerate.
  for (let i = 0; i < 40; i += 1) {
    if ((await score.innerText()).trim() === "0") break;
    await page.keyboard.press("ArrowUp");
    await page.waitForTimeout(250);
  }
  if ((await score.innerText()).trim() !== "0") {
    throw new Error("the car never started");
  }

  await page.keyboard.down("ArrowUp");
  const deadline = Date.now() + 40000;
  let outer = true;
  while (Date.now() < deadline) {
    if (await results.isVisible().catch(() => false)) break;
    // Outer lane meets oncoming traffic; inner meets traffic going the same way.
    await page.keyboard.press(outer ? "ArrowLeft" : "ArrowRight");
    outer = !outer;
    await page.waitForTimeout(700);
  }
  await page.keyboard.up("ArrowUp");
  await results.waitFor({ state: "visible", timeout: 5000 });

  const signIn = page.locator("#sign-in-button");
  if (await signIn.isVisible().catch(() => false)) {
    await acceptGoogleAccount(page, signIn);
  }

  await page.locator("#retry-button").waitFor({ state: "visible", timeout: 20000 });
};

async function acceptGoogleAccount(page, signIn) {
  const popupPromise = page.waitForEvent("popup", { timeout: 20000 }).catch(() => null);
  await signIn.click();
  const popup = await popupPromise;
  if (!popup) {
    throw new Error(
      "Google sign-in did not open. Save the test Gmail once with: npx kaloko auth save --env local --account player",
    );
  }

  const account = popup.locator("[data-identifier], [data-email]").first();
  const email = popup.locator("input[type='email']");
  const deadline = Date.now() + 25000;
  while (Date.now() < deadline) {
    if (popup.isClosed()) return;
    if (await account.isVisible().catch(() => false)) {
      await account.click();
      await popup.waitForEvent("close", { timeout: 20000 }).catch(() => {});
      return;
    }
    if (await email.isVisible().catch(() => false)) break;
    await page.waitForTimeout(300);
  }
  if (popup.isClosed()) return;

  throw new Error(
    "Google asked for an email. Save the dedicated test Gmail once with: npx kaloko auth save --env local --account player. The password stays out of git.",
  );
}
