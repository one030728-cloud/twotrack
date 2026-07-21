import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { ManagementPreviewPage } from "./management-preview-page";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-07-16T12:00:00+09:00"));

  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  }
});

afterEach(() => {
  vi.useRealTimers();
});

function expectNeutralSelect(name: string) {
  expect(screen.getByLabelText(name)).toHaveClass(
    "border-none",
    "bg-transparent",
    "py-0",
    "pl-0",
  );
}

function renderPage(kind: "changes" | "woo" | "internet") {
  return render(
    <SnackbarProvider>
      <ManagementPreviewPage kind={kind} />
    </SnackbarProvider>,
  );
}

describe("ManagementPreviewPage", () => {
  it("등록은 Modal로, 상세는 Drawer로 분리해 연다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    expectNeutralSelect("성수 베이커리 변경유형");
    expectNeutralSelect("성수 베이커리 사업자유형");
    expectNeutralSelect("성수 베이커리 입금여부");

    await user.click(screen.getByRole("button", { name: "변경 접수 등록" }));

    const createDialog = screen.getByRole("dialog", {
      name: "변경 접수 등록",
    });
    expect(createDialog).toHaveClass("m-auto");
    expect(createDialog).not.toHaveClass("right-0");
    expect(within(createDialog).getByLabelText("변경유형")).toBeInTheDocument();
    expect(
      within(createDialog).getByLabelText("사업자 유형"),
    ).toBeInTheDocument();
    expect(
      within(createDialog).getByLabelText("입금 여부"),
    ).toBeInTheDocument();
    expect(
      within(createDialog).queryByLabelText("상태"),
    ).not.toBeInTheDocument();
    expect(within(createDialog).queryByText("기타")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "등록 닫기" }));
    await user.click(screen.getByText("성수 베이커리"));

    const detailDrawer = screen.getByRole("dialog", { name: "성수 베이커리" });
    expect(detailDrawer).toHaveClass("right-0");
    expect(detailDrawer).toHaveClass("left-auto");
    expect(within(detailDrawer).getByLabelText("변경유형")).toBeInTheDocument();
    expect(
      within(detailDrawer).getByLabelText("사업자 유형"),
    ).toBeInTheDocument();
    expect(
      within(detailDrawer).getByLabelText("입금 여부"),
    ).toBeInTheDocument();
    expect(
      within(detailDrawer).queryByLabelText("상태"),
    ).not.toBeInTheDocument();
    expect(within(detailDrawer).queryByText("기타")).not.toBeInTheDocument();
  });

  it("필수 표시 없이 등록할 수 있고 사업자번호는 선택값으로 둔다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(screen.getByRole("button", { name: "변경 접수 등록" }));

    const dialog = screen.getByRole("dialog", { name: "변경 접수 등록" });
    const submit = within(dialog).getByRole("button", { name: "등록" });
    expect(submit).toBeEnabled();

    await user.type(within(dialog).getByLabelText(/상호명/), "테스트 상점");
    await user.type(within(dialog).getByLabelText(/대표자명/), "홍길동");
    await user.type(within(dialog).getByLabelText(/연락처/), "010-1234-5678");

    expect(within(dialog).getByLabelText("사업자번호")).toHaveValue("");
    expect(submit).toBeEnabled();
  });

  it("등록과 상세 Drawer의 dropdown을 열고 값을 변경할 수 있다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(screen.getByRole("button", { name: "변경 접수 등록" }));

    const createDialog = screen.getByRole("dialog", {
      name: "변경 접수 등록",
    });
    expect(within(createDialog).getByLabelText("변경유형")).toHaveTextContent(
      "미설정",
    );
    expect(within(createDialog).getByLabelText("담당자")).toHaveTextContent(
      "미배정",
    );

    await user.click(within(createDialog).getByLabelText("담당자"));
    expect(
      within(createDialog).queryByRole("option", { name: "미배정" }),
    ).not.toBeInTheDocument();
    await user.click(
      within(createDialog).getByRole("option", { name: "서지은" }),
    );

    await user.click(within(createDialog).getByLabelText("변경유형"));
    await user.click(
      within(createDialog).getByRole("option", { name: "상호변경" }),
    );
    expect(within(createDialog).getByLabelText("변경유형")).toHaveTextContent(
      "상호변경",
    );

    await user.click(screen.getByRole("button", { name: "등록 닫기" }));
    await user.click(screen.getByText("성수 베이커리"));

    const detailDrawer = screen.getByRole("dialog", { name: "성수 베이커리" });
    await user.click(within(detailDrawer).getByLabelText("변경유형"));
    await user.click(
      within(detailDrawer).getByRole("option", { name: "주소변경" }),
    );
    expect(within(detailDrawer).getByLabelText("변경유형")).toHaveTextContent(
      "주소변경",
    );
  });

  it("상세 Drawer에서 저장한 값을 목록에 반영한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(screen.getByText("성수 베이커리"));
    const owner = screen.getByLabelText(/대표자명/);
    await user.clear(owner);
    await user.type(owner, "김새대표");
    await user.click(screen.getByRole("button", { name: "저장" }));

    expect(
      screen.queryByRole("dialog", { name: "상세 정보" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("김새대표")).toBeInTheDocument();
  });

  it("KPI를 실데이터에서 계산하고 클릭한 조건으로 목록을 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    expect(
      screen.getByRole("button", { name: /오늘 접수\s*2\s*건/ }),
    ).toBeInTheDocument();
    const waitingKpi = screen.getByRole("button", {
      name: /서류 대기\s*2\s*건/,
    });

    await user.click(waitingKpi);

    expect(waitingKpi).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("전체 2건")).toBeInTheDocument();
    expect(screen.getByText("포레스트 키친")).toBeInTheDocument();
    expect(screen.getByText("브릭 하우스")).toBeInTheDocument();
    expect(screen.queryByText("성수 베이커리")).not.toBeInTheDocument();
  });

  it("변경 관리 테이블을 확정 컬럼 순서로 표시한다", () => {
    renderPage("changes");

    const headers = within(screen.getByTestId("management-table"))
      .getAllByRole("columnheader")
      .slice(1)
      .map((header) => header.textContent?.trim());

    expect(headers).toEqual([
      "접수일",
      "변경유형",
      "사업자유형",
      "상호명",
      "대표자",
      "연락처",
      "등록자",
      "담당자",
      "입금여부",
      "상태",
      "메모",
    ]);
  });

  it("변경 관리 목록에서 상태를 인라인으로 변경할 수 있다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    const statusSelect = screen.getByLabelText("성수 베이커리 상태");
    expect(statusSelect).toHaveClass("rounded-md", "font-semibold");

    await user.click(statusSelect);
    await user.click(screen.getByRole("option", { name: "접수완료" }));

    expect(screen.getByLabelText("성수 베이커리 상태")).toHaveTextContent(
      "접수완료",
    );
  });

  it("변경 관리 접수일 필터를 목록에 반영한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(screen.getByRole("button", { name: "접수일 기간" }));
    await user.click(
      screen.getByRole("button", { name: /2026년 7월 15일 수요일/ }),
    );
    await user.click(
      screen.getByRole("button", { name: /2026년 7월 16일 목요일/ }),
    );
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("tab", { name: /전체 4건/ })).toBeInTheDocument();
    expect(screen.getByText("오후의 커피")).toBeInTheDocument();
    expect(screen.getByText("브릭 하우스")).toBeInTheDocument();
    expect(screen.queryByText("하루분식")).not.toBeInTheDocument();
  });

  it("연락처 클릭 시 클립보드에 복사하고 snackbar를 표시한다", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    renderPage("changes");

    await user.click(screen.getByRole("button", { name: "010-3281-0472" }));

    expect(writeText).toHaveBeenCalledWith("010-3281-0472");
    expect(await screen.findByRole("status")).toHaveTextContent(
      "연락처 복사됨",
    );
  });

  it("관리 메모에서 북마크와 삭제 기능을 표시한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(
      screen.getByRole("button", { name: "성수 베이커리 메모" }),
    );

    expect(
      screen.getByRole("button", { name: "고정 해제" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: "고정" }).length,
    ).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "삭제" })).toBeInTheDocument();
  });

  it("내 업무를 로그인 사용자 서지은 기준으로 필터링한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    await user.click(screen.getByRole("tab", { name: /내 업무 2건/ }));

    expect(screen.getByText("성수 베이커리")).toBeInTheDocument();
    expect(screen.getByText("하루분식")).toBeInTheDocument();
    expect(screen.queryByText("포레스트 키친")).not.toBeInTheDocument();
  });

  it("우국상 날짜 형식을 통일하고 인라인 편집 시 상세 Drawer를 열지 않는다", async () => {
    const user = userEvent.setup();
    renderPage("woo");

    expect(screen.getByLabelText("담소 한식당 접수일")).toHaveTextContent(
      "2026-07-16",
    );
    expectNeutralSelect("담소 한식당 분류");
    expectNeutralSelect("담소 한식당 세팅");
    expect(screen.getByLabelText("담소 한식당 간편결제")).toHaveValue(
      "토스페이",
    );

    await user.click(screen.getByLabelText("담소 한식당 분류"));
    await user.click(screen.getByRole("option", { name: "승계" }));

    expect(screen.getByLabelText("담소 한식당 분류")).toHaveTextContent("승계");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("우국상 필터를 접수일과 업무 상태 항목으로 표시한다", async () => {
    const user = userEvent.setup();
    renderPage("woo");

    expect(screen.queryByLabelText("분류 전체")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /가맹미확인/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("접수일 기간")).toBeInTheDocument();
    expect(screen.getByLabelText("가맹 여부 전체")).toBeInTheDocument();
    expect(screen.getByLabelText("세팅 전체")).toBeInTheDocument();
    expect(screen.getByLabelText("간편결제 전체")).toBeInTheDocument();

    await user.click(screen.getByLabelText("접수일 기간"));
    await user.click(
      screen.getByRole("button", { name: /2026년 7월 15일 수요일/ }),
    );
    await user.click(
      screen.getByRole("button", { name: /2026년 7월 16일 목요일/ }),
    );
    await user.click(screen.getByRole("button", { name: "확인" }));

    expect(screen.getByRole("tab", { name: /전체 3건/ })).toBeInTheDocument();
    expect(screen.getByText("소담족발 마포점")).toBeInTheDocument();
    expect(screen.getByText("담소 한식당")).toBeInTheDocument();
    expect(screen.queryByText("모먼트 펍")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("간편결제 전체"));
    await user.click(screen.getByRole("option", { name: "미등록" }));

    expect(screen.getByText("소담족발 마포점")).toBeInTheDocument();
  });

  it("우국상 등록 폼을 세팅·간편결제·날짜 메모 입력 기준으로 표시한다", async () => {
    const user = userEvent.setup();
    renderPage("woo");

    await user.click(screen.getByRole("button", { name: "우국상 접수 등록" }));

    const dialog = screen.getByRole("dialog", { name: "우국상 접수 등록" });
    await user.click(within(dialog).getByLabelText("세팅"));
    expect(
      within(dialog).getByRole("option", { name: "PC세팅" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("option", { name: "포스세팅" }),
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole("option", { name: "PC세팅" }));

    await user.type(within(dialog).getByLabelText("간편결제"), "네이버페이");
    expect(within(dialog).getByLabelText("간편결제")).toHaveValue("네이버페이");

    await user.type(
      within(dialog).getByLabelText("연락처"),
      "010-8048-0904(매장)",
    );
    expect(within(dialog).getByLabelText("연락처")).toHaveValue(
      "010-8048-0904(매장)",
    );

    expect(within(dialog).getByLabelText("인터넷 개통일자")).toHaveAttribute(
      "placeholder",
      "날짜 또는 메모",
    );
    expect(
      within(dialog).getByRole("button", { name: "인터넷 개통일자 달력 열기" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "포스 설치일 달력 열기" }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByText("최초 메모")).not.toBeInTheDocument();
  });

  it("상세 필터를 실제 목록과 탭 개수에 반영한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    expect(screen.queryByLabelText("상태 전체")).not.toBeInTheDocument();

    await user.click(screen.getByLabelText("입금 전체"));
    await user.click(screen.getByRole("option", { name: "N" }));

    expect(screen.getByText("전체 2건")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /접수완료 0/ })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /서류대기 1/ }));
    expect(screen.getByText("전체 1건")).toBeInTheDocument();
  });

  it("컬럼 최소 폭을 지키면서 테이블은 페이지 폭에 맞춰 확장한다", () => {
    renderPage("changes");

    const table = screen.getByTestId("management-table");
    const resizeHandle = screen.getByRole("separator", {
      name: "상호명 열 너비 조절",
    });
    const nameColumn = table.querySelector('col[data-column-key="name"]');

    expect(table).toHaveStyle({ width: "100%", minWidth: "1254px" });
    expect(nameColumn).toHaveStyle({ width: "180px" });
    expect(resizeHandle).toHaveAttribute("aria-valuemin", "130");

    for (let index = 0; index < 6; index += 1) {
      fireEvent.keyDown(resizeHandle, { key: "ArrowLeft" });
    }

    expect(resizeHandle).toHaveAttribute("aria-valuenow", "130");
    expect(nameColumn).toHaveStyle({ width: "130px" });

    fireEvent.keyDown(resizeHandle, { key: "ArrowRight" });

    expect(resizeHandle).toHaveAttribute("aria-valuenow", "140");
    expect(nameColumn).toHaveStyle({ width: "140px" });
    expect(table).toHaveStyle({ width: "100%", minWidth: "1214px" });
    expect(
      screen.queryByRole("separator", { name: "메모 열 너비 조절" }),
    ).not.toBeInTheDocument();
  });

  it("정렬 헤더 클릭 시 행 순서와 정렬 방향을 변경한다", async () => {
    const user = userEvent.setup();
    renderPage("changes");

    const table = screen.getByTestId("management-table");
    const nameSort = screen.getByRole("button", { name: "상호명 정렬" });
    const receivedAtHeader = screen
      .getByRole("button", { name: "접수일 정렬" })
      .closest("th");

    expect(receivedAtHeader).toHaveAttribute("aria-sort", "descending");
    expect(screen.queryByLabelText("정렬")).not.toBeInTheDocument();

    await user.click(nameSort);

    expect(nameSort.closest("th")).toHaveAttribute("aria-sort", "ascending");
    expect(
      within(within(table).getAllByRole("row")[1]).getByText("브릭 하우스"),
    ).toBeInTheDocument();

    await user.click(nameSort);

    expect(nameSort.closest("th")).toHaveAttribute("aria-sort", "descending");
    expect(
      within(within(table).getAllByRole("row")[1]).getByText("하루분식"),
    ).toBeInTheDocument();
  });

  it("인터넷 관리 목록을 확정 컬럼 순서로 표시한다", () => {
    renderPage("internet");

    const headers = within(screen.getByTestId("management-table"))
      .getAllByRole("columnheader")
      .slice(1)
      .map((header) => header.textContent?.trim());

    expect(headers).toEqual([
      "접수일",
      "개통완료일",
      "상호명",
      "대표자",
      "연락처",
      "등록자",
      "담당자",
      "상태",
      "메모",
    ]);
  });

  it("인터넷 개통완료일을 날짜로 정렬한다", async () => {
    const user = userEvent.setup();
    renderPage("internet");

    const table = screen.getByTestId("management-table");
    const openedAtSort = screen.getByRole("button", {
      name: "개통완료일 정렬",
    });

    await user.click(openedAtSort);

    expect(openedAtSort.closest("th")).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(
      within(within(table).getAllByRole("row")[1]).getByText("담소 한식당"),
    ).toBeInTheDocument();

    await user.click(openedAtSort);

    expect(openedAtSort.closest("th")).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(
      within(within(table).getAllByRole("row")[1]).getByText("브릭 하우스"),
    ).toBeInTheDocument();
  });

  it("인터넷 중복 UI를 제거하고 확정 목록 구성을 표시한다", async () => {
    const user = userEvent.setup();
    renderPage("internet");

    expect(screen.queryByLabelText("상태 전체")).not.toBeInTheDocument();
    expect(screen.getByRole("tablist")).toHaveClass("flex", "items-center");
    expect(screen.getByRole("tablist")).not.toHaveClass("overflow-x-auto");
    expect(
      screen.getAllByRole("button", { name: "엑셀 다운로드" }),
    ).toHaveLength(1);
    expect(screen.getByRole("button", { name: "도움말" })).toHaveClass(
      "size-9",
      "border-border",
      "bg-card",
    );
    expect(
      screen.queryByRole("button", { name: "상세 보기" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("성수 베이커리")).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "성수 베이커리 메모" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("성수 베이커리 구분"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("성수 베이커리 통신사"),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("서지은").length).toBeGreaterThan(0);
    expect(screen.getByLabelText("성수 베이커리 상태")).toHaveClass(
      "rounded-md",
      "px-2.5",
      "py-1.5",
      "text-[11.5px]",
      "!bg-green-500/15",
    );

    await user.click(screen.getByLabelText("성수 베이커리 상태"));
    await user.click(screen.getByRole("option", { name: "개통완료" }));
    expect(screen.getByLabelText("성수 베이커리 개통완료일")).toHaveTextContent(
      "2026-07-16",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("인터넷 고급 필터를 상태 탭과 중복 없이 표시하고 목록에 반영한다", async () => {
    const user = userEvent.setup();
    renderPage("internet");

    expect(screen.queryByLabelText("상태 전체")).not.toBeInTheDocument();
    expect(screen.getByLabelText("구분 전체")).toBeInTheDocument();
    expect(screen.getByLabelText("통신사 전체")).toBeInTheDocument();
    expect(screen.getByLabelText("속도 전체")).toBeInTheDocument();
    expect(screen.getByLabelText("접수일 기간")).toBeInTheDocument();

    await user.click(screen.getByLabelText("통신사 전체"));
    await user.click(screen.getByRole("option", { name: "LG" }));

    expect(screen.getByRole("tab", { name: /전체 1건/ })).toBeInTheDocument();
    expect(screen.getByText("카페 무이")).toBeInTheDocument();
    expect(screen.queryByText("성수 베이커리")).not.toBeInTheDocument();
  });

  it("인터넷 등록 폼에서 속도 옵션과 비용 표시 기준을 적용한다", async () => {
    const user = userEvent.setup();
    renderPage("internet");

    await user.click(screen.getByRole("button", { name: "인터넷 접수 등록" }));

    const dialog = screen.getByRole("dialog", { name: "인터넷 접수 등록" });
    await user.click(within(dialog).getByLabelText("속도"));
    expect(
      within(dialog).getByRole("option", { name: "100M" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("option", { name: "500M" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("option", { name: "직접입력" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("option", { name: "1G" }),
    ).not.toBeInTheDocument();
    await user.click(within(dialog).getByRole("option", { name: "100M" }));

    await user.type(within(dialog).getByLabelText("월요금"), "38500");
    await user.type(within(dialog).getByLabelText("설치비"), "27500");

    expect(within(dialog).getByLabelText("월요금")).toHaveValue("38,500");
    expect(within(dialog).getByLabelText("설치비")).toHaveValue("27,500");
    expect(within(dialog).queryByText("최초 메모")).not.toBeInTheDocument();
    expect(within(dialog).queryByLabelText("비고")).not.toBeInTheDocument();
  });
});
