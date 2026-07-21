import { expect, test } from "@playwright/test";

test("비로그인 사용자는 보호 페이지에서 로그인 화면으로 이동한다", async ({
  page,
}) => {
  await page.goto("/franchise-receipts");

  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
});

test("CS 사용자는 CS 메뉴만 보고 설치 관리에 접근할 수 없다", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /서지은 팀장/ }).click();

  await expect(page.getByRole("link", { name: "가맹 접수" })).toBeVisible();
  await expect(page.getByRole("link", { name: "설치 관리" })).toHaveCount(0);

  await page.goto("/installs");
  await expect(
    page.getByRole("heading", { name: "접근 권한 없음" }),
  ).toBeVisible();
});

test("기술지원 사용자는 설치 관리와 매장 운영 이력에 접근한다", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /박기사/ }).click();

  await expect(page.getByRole("link", { name: "설치 관리" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "매장 운영 이력" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "가맹 접수" })).toHaveCount(0);

  await page.goto("/stores");
  await expect(
    page.getByRole("heading", { name: "매장 운영 이력" }),
  ).toBeVisible();
});

test("관리자는 직원 관리 화면에 접근하고 로그아웃할 수 있다", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByRole("button", { name: /관리자/ }).click();

  await page.getByRole("link", { name: "직원 관리" }).click();
  await expect(page.getByRole("heading", { name: "직원 관리" })).toBeVisible();

  await page.getByRole("button", { name: /관리자/ }).click();
  await page.getByRole("menuitem", { name: "로그아웃" }).click();

  await expect(page.getByRole("heading", { name: "로그인" })).toBeVisible();
});
