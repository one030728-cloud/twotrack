import { test, expect } from "@playwright/test";

test("홈 페이지가 정상적으로 로드된다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "CS 계정으로 로그인" }).click();

  await expect(
    page.getByRole("heading", { name: "POSMOS 전산 시스템" }),
  ).toBeVisible();
});
