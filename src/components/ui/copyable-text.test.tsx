import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CopyableText } from "@/components/ui/copyable-text";
import { SnackbarProvider } from "@/components/ui/snackbar";

describe("CopyableText", () => {
  it("클릭하면 값을 복사하고 snackbar를 표시한다", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    render(
      <SnackbarProvider>
        <CopyableText value="010-2231-8842" label="연락처" />
      </SnackbarProvider>,
    );

    await user.click(screen.getByRole("button", { name: "010-2231-8842" }));

    expect(writeText).toHaveBeenCalledWith("010-2231-8842");
    const snackbar = await screen.findByRole("status");
    expect(snackbar).toHaveTextContent("연락처 복사됨");
    expect(snackbar).toHaveClass("w-[min(375px,calc(100vw-32px))]");
  });
});
