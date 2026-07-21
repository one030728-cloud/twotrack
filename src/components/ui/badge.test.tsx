import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("텍스트를 렌더링한다", () => {
    render(<Badge>서류대기</Badge>);
    expect(screen.getByText("서류대기")).toBeInTheDocument();
  });

  it("tone에 따라 색상 클래스가 달라진다", () => {
    render(<Badge tone="error">서류미비</Badge>);
    expect(screen.getByText("서류미비").className).toContain("error");
  });

  it("primary tone은 강조 색상 클래스를 적용한다", () => {
    render(<Badge tone="primary">메모</Badge>);
    expect(screen.getByText("메모").className).toContain("primary");
  });

  it("size에 따라 크기 클래스가 달라진다", () => {
    render(<Badge size="sm">변경 이력</Badge>);
    expect(screen.getByText("변경 이력").className).toContain("text-[10px]");
  });
});
