import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { StoresPage } from "./stores-page";

describe("StoresPage", () => {
  function renderPage() {
    render(
      <SnackbarProvider>
        <StoresPage />
      </SnackbarProvider>,
    );
  }

  it("매장 목록과 첫 매장 상세를 함께 표시한다", () => {
    renderPage();

    expect(screen.getByText("매장 운영 이력")).toBeInTheDocument();
    expect(screen.getByText("전체 매장")).toBeInTheDocument();
    expect(screen.getAllByText("카페 아모르")).toHaveLength(2);
    expect(screen.getAllByText("현재 설치 기기")).toHaveLength(2);
    expect(screen.getByText("카페아모르_카운터도면.pdf")).toBeInTheDocument();
  });

  it("목록에서 매장을 선택하면 상세가 바뀐다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole("button", { name: /명동떡볶이 본점/ }));

    expect(screen.getAllByText("명동떡볶이 본점")).toHaveLength(2);
    expect(screen.getAllByText(/A100-2407-009/)).toHaveLength(2);
    expect(screen.getByText("명동떡볶이_완료사진.jpg")).toBeInTheDocument();
  });

  it("검색어로 매장 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.type(
      screen.getByPlaceholderText("매장명, 대표자, 전화번호 검색"),
      "하루분식",
    );

    expect(screen.getAllByText("하루분식")).toHaveLength(2);
    expect(screen.queryByText("카페 아모르")).not.toBeInTheDocument();
    expect(screen.getByText("하루분식_AS현장사진.jpg")).toBeInTheDocument();
  });
});
