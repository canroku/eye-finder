import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Eye Score/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Analize Başla/i })).toBeVisible();
});

test("demo page loads", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByRole("heading", { name: /Demo Modu/i })).toBeVisible();
});

test("settings page loads", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: /Ayarlar/i })).toBeVisible();
});
