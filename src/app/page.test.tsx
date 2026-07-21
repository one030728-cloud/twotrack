import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders the POSMOS heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: "POSMOS 전산 시스템" }),
    ).toBeInTheDocument();
  });
});
