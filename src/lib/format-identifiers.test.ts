import { describe, expect, it } from "vitest";
import { formatBusinessNumber, formatPhoneNumber } from "./format-identifiers";

describe("formatPhoneNumber", () => {
  it.each([
    ["01022318842", "010-2231-8842"],
    ["0212345678", "02-1234-5678"],
    ["021234567", "02-123-4567"],
    ["0331234567", "033-123-4567"],
    ["03312345678", "033-1234-5678"],
    ["050712345678", "0507-1234-5678"],
  ])("%s를 하이픈 형식으로 변환한다", (input, expected) => {
    expect(formatPhoneNumber(input)).toBe(expected);
  });

  it("숫자가 아닌 문자는 제거한다", () => {
    expect(formatPhoneNumber("010 2231 ab8842")).toBe("010-2231-8842");
  });
});

describe("formatBusinessNumber", () => {
  it("사업자번호를 3-2-5 형식으로 변환한다", () => {
    expect(formatBusinessNumber("1234567890")).toBe("123-45-67890");
  });
});
