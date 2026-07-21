import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductCombobox } from "./product-combobox";

const OPTIONS = [
  { value: "토스프론트", label: "토스프론트" },
  { value: "토스단말기", label: "토스단말기" },
  { value: "키오스크리더기", label: "키오스크리더기" },
];

describe("ProductCombobox", () => {
  it("검색어로 상품을 좁히고 선택한다", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ProductCombobox
        label="상품"
        value="토스프론트"
        options={OPTIONS}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "상품" }));
    await user.type(screen.getByPlaceholderText("상품 검색"), "리더");
    expect(screen.queryByText("토스단말기")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "키오스크리더기" }));

    expect(onValueChange).toHaveBeenCalledWith("키오스크리더기");
  });
});
