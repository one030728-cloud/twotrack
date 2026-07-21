import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useInstallations } from "./use-installations";
import { resetInstallsForTest } from "@/mocks/handlers";

beforeEach(() => resetInstallsForTest());
afterEach(() => resetInstallsForTest());

async function setupLoaded() {
  const { result } = renderHook(() => useInstallations());
  await waitFor(() => expect(result.current.loading).toBe(false));
  return result;
}

describe("useInstallations", () => {
  it("초기 구분은 설치이고 해당 건수만 보여준다", async () => {
    const result = await setupLoaded();
    expect(result.current.kind).toBe("install");
    expect(result.current.installs).toHaveLength(12);
    expect(
      result.current.filteredInstalls.every((r) => r.kind === "install"),
    ).toBe(true);
  });

  it("구분을 바꾸면 해당 구분 건수만 필터링되고 상태탭/페이지가 리셋된다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setPage(2));
    act(() => result.current.setKind("parcel"));

    expect(result.current.statusTab).toBe("all");
    expect(result.current.currentPage).toBe(1);
    expect(
      result.current.filteredInstalls.every((r) => r.kind === "parcel"),
    ).toBe(true);
  });

  it("구분별 상태 탭으로 필터링하면 해당 상태만 남는다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setKind("as"));
    act(() => result.current.setStatusTab("asDone"));

    expect(
      result.current.filteredInstalls.every((r) => r.status === "asDone"),
    ).toBe(true);
    expect(result.current.filteredInstalls.length).toBeGreaterThan(0);
  });

  it("검색어로 고객명/전화번호/송장번호를 필터링한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setSearchQuery("카페 아모르"));

    expect(result.current.filteredInstalls).toHaveLength(1);
    expect(result.current.filteredInstalls[0].customerName).toBe("카페 아모르");
  });

  it("담당기사 필터가 적용된다", async () => {
    const result = await setupLoaded();

    act(() => result.current.setTechFilter("박기사"));

    expect(
      result.current.filteredInstalls.every((r) => r.assignedTech === "박기사"),
    ).toBe(true);
    expect(result.current.filteredInstalls.length).toBeGreaterThan(0);
  });

  it("updateField는 목록을 낙관적으로 갱신한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.updateField(1, { status: "installDone" }));

    expect(result.current.installs.find((r) => r.id === 1)?.status).toBe(
      "installDone",
    );
  });

  it("addInstall은 새 항목을 맨 앞에 추가한다", async () => {
    const result = await setupLoaded();

    await act(async () => {
      await result.current.addInstall({
        kind: "as",
        customerName: "새 매장",
        phone: "010-1111-2222",
      });
    });

    expect(result.current.installs).toHaveLength(13);
    expect(result.current.installs[0].customerName).toBe("새 매장");
    expect(result.current.installs[0].source).toBe("manual");
  });

  it("전체 선택은 가맹 접수 연동 건을 제외한 직접 등록 건만 선택한다", async () => {
    const result = await setupLoaded();

    act(() => result.current.toggleSelectAll());

    const franchiseIds = result.current.filteredInstalls
      .filter((r) => r.source === "franchise")
      .map((r) => r.id);
    const manualIds = result.current.filteredInstalls
      .filter((r) => r.source === "manual")
      .map((r) => r.id);

    expect(manualIds.every((id) => result.current.selected[id])).toBe(true);
    expect(franchiseIds.some((id) => result.current.selected[id])).toBe(false);
    expect(result.current.allSelected).toBe(true);
  });

  it("필터 조건을 바꾸면 숨겨진 선택 항목을 삭제 대상으로 남기지 않는다", async () => {
    const result = await setupLoaded();

    const installManual = result.current.installs.find(
      (r) => r.kind === "install" && r.source === "manual",
    )!;

    act(() => result.current.toggleRow(installManual.id));
    expect(result.current.selectedCount).toBe(1);

    act(() => result.current.setKind("parcel"));
    expect(result.current.selectedCount).toBe(0);

    await act(async () => {
      await result.current.deleteSelected();
    });

    expect(result.current.installs.some((r) => r.id === installManual.id)).toBe(
      true,
    );
  });

  it("deleteSelected는 직접 등록 건만 삭제하고 가맹 접수 연동 건은 남긴다", async () => {
    const result = await setupLoaded();

    const franchiseRecord = result.current.installs.find(
      (r) => r.kind === "install" && r.source === "franchise",
    )!;
    const manualRecord = result.current.installs.find(
      (r) => r.kind === "install" && r.source === "manual",
    )!;

    act(() => result.current.toggleRow(franchiseRecord.id));
    act(() => result.current.toggleRow(manualRecord.id));

    await act(async () => {
      await result.current.deleteSelected();
    });

    expect(result.current.installs.some((r) => r.id === manualRecord.id)).toBe(
      false,
    );
    expect(
      result.current.installs.some((r) => r.id === franchiseRecord.id),
    ).toBe(true);
  });
});
