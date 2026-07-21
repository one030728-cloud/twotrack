import { afterEach, describe, expect, it } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, useTheme } from "./theme-provider";
import { THEME_STORAGE_KEY } from "./theme-script";

function Probe() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span>{theme}</span>
      <button type="button" onClick={() => setTheme("dark")}>
        다크로
      </button>
      <button type="button" onClick={() => setTheme("pink")}>
        핑크로
      </button>
      <button type="button" onClick={() => setTheme("light")}>
        라이트로
      </button>
    </div>
  );
}

afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-theme");
  localStorage.clear();
});

describe("ThemeProvider", () => {
  it("기본값은 light이며 setTheme으로 dark/pink로 전환하고 저장한다", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );

    expect(screen.getByText("light")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "다크로" }));
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(screen.getByRole("button", { name: "핑크로" }));
    expect(screen.getByText("pink")).toBeInTheDocument();
    expect(document.documentElement.getAttribute("data-theme")).toBe("pink");
    expect(document.documentElement.style.colorScheme).toBe("light");
  });

  it("html에 이미 data-theme=pink가 있으면 pink로 초기화된다", () => {
    document.documentElement.setAttribute("data-theme", "pink");
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByText("pink")).toBeInTheDocument();
  });
});
