import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("label과 textarea가 연결되고 입력할 수 있다", async () => {
    const user = userEvent.setup();
    render(<Textarea label="메모" />);
    const textarea = screen.getByRole("textbox", { name: "메모" });
    await user.type(textarea, "서류 재제출 요청");
    expect(textarea).toHaveValue("서류 재제출 요청");
  });
});
