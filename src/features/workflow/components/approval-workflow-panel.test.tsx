import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApprovalWorkflowPanel } from "./approval-workflow-panel";
import type { ApprovalWorkflow } from "@/features/workflow/types";

// jsdom은 HTMLDialogElement의 showModal/close를 구현하지 않으므로
// 반려 사유 다이얼로그가 뜨는 테스트를 위해 최소 폴리필을 등록한다.
beforeEach(() => {
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

function makeWorkflow(
  overrides: Partial<ApprovalWorkflow> = {},
): ApprovalWorkflow {
  return {
    id: "wf-1",
    kind: "franchise_transfer",
    domain: "cs",
    entityId: 1,
    stage: "manager_requested",
    requestedBy: "cs-manager",
    requestedByName: "정지은 매니저",
    requestedAt: "2026-07-17T10:00:00.000Z",
    history: [
      {
        id: "wf-action-1",
        action: "request",
        actorId: "cs-manager",
        actorName: "정지은 매니저",
        actorPosition: "cs_manager",
        comment: "",
        createdAt: "2026-07-17T10:00:00.000Z",
      },
    ],
    resumeStage: null,
    pendingInfoTargetId: null,
    ...overrides,
  };
}

describe("ApprovalWorkflowPanel", () => {
  it("로딩 중에는 안내 문구만 보여준다", () => {
    render(
      <ApprovalWorkflowPanel
        workflow={null}
        loading
        canRequest={false}
        canApproveResponsible={false}
        canApproveTeamLead={false}
        canReject={false}
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(
      screen.getByText("승인 현황을 불러오는 중입니다."),
    ).toBeInTheDocument();
  });

  it("요청 권한이 있으면 요청 버튼을 보여주고 클릭 시 onRequest가 호출된다", async () => {
    const user = userEvent.setup();
    const onRequest = vi.fn();
    render(
      <ApprovalWorkflowPanel
        workflow={null}
        loading={false}
        canRequest
        canApproveResponsible={false}
        canApproveTeamLead={false}
        canReject={false}
        requestLabel="이관 요청"
        onRequest={onRequest}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "이관 요청" }));
    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  it("책임매니저 승인 권한이 있으면 승인 버튼을 보여주고 이력을 표시한다", () => {
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow()}
        loading={false}
        canRequest={false}
        canApproveResponsible
        canApproveTeamLead={false}
        canReject
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "책임매니저 승인" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "반려" })).toBeInTheDocument();
    expect(screen.getByText(/정지은 매니저/)).toBeInTheDocument();
  });

  it("반려 버튼을 누르면 사유 입력 후에만 반려가 제출된다", async () => {
    const user = userEvent.setup();
    const onReject = vi.fn();
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow()}
        loading={false}
        canRequest={false}
        canApproveResponsible
        canApproveTeamLead={false}
        canReject
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onReject={onReject}
      />,
    );
    await user.click(screen.getByRole("button", { name: "반려" }));
    const dialog = screen.getByRole("dialog");
    const submit = within(dialog).getByRole("button", { name: "반려하기" });
    expect(submit).toBeDisabled();

    await user.type(
      within(dialog).getByPlaceholderText("반려 사유를 입력하세요"),
      "서류 누락",
    );
    expect(submit).toBeDisabled();

    await user.click(
      within(dialog).getByRole("combobox", { name: "재처리 담당자" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "정지은 매니저" }),
    );
    await user.type(within(dialog).getByLabelText("재처리기한"), "2026-07-25");

    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);
    expect(onReject).toHaveBeenCalledWith({
      reason: "서류 누락",
      reprocessAssigneeId: "cs-manager",
      reprocessDueAt: "2026-07-25",
    });
  });

  it("반려 상태면 단계 배지 대신 반려됨 뱃지를 보여준다", () => {
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow({ stage: "rejected" })}
        loading={false}
        canRequest
        canApproveResponsible={false}
        canApproveTeamLead={false}
        canReject={false}
        requestLabel="이관 요청"
        onRequest={vi.fn()}
        onApprove={vi.fn()}
        onReject={vi.fn()}
      />,
    );
    expect(screen.getByText("반려됨")).toBeInTheDocument();
  });

  it("조건부 승인 다이얼로그는 보완사항·담당자·기한이 모두 있어야 제출된다", async () => {
    const user = userEvent.setup();
    const onConditionalApprove = vi.fn();
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow()}
        loading={false}
        canRequest={false}
        canApproveResponsible
        canApproveTeamLead={false}
        canReject
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onConditionalApprove={onConditionalApprove}
        onReject={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "조건부 승인" }));
    const dialog = screen.getByRole("dialog", { name: "조건부 승인" });
    const submit = within(dialog).getByRole("button", {
      name: "조건부 승인하기",
    });
    expect(submit).toBeDisabled();

    await user.type(
      within(dialog).getByLabelText("진행을 허용하는 사유"),
      "일정상 우선 진행",
    );
    await user.type(
      within(dialog).getByLabelText("보완사항"),
      "사업자등록증 재제출",
    );
    await user.click(
      within(dialog).getByRole("combobox", { name: "보완 담당자" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "정지은 매니저" }),
    );
    await user.type(within(dialog).getByLabelText("보완기한"), "2026-07-30");

    await waitFor(() => expect(submit).not.toBeDisabled());
    await user.click(submit);
    expect(onConditionalApprove).toHaveBeenCalledWith({
      allowReason: "일정상 우선 진행",
      followUpNote: "사업자등록증 재제출",
      followUpAssigneeId: "cs-manager",
      followUpDueAt: "2026-07-30",
    });
  });

  it("추가정보 요청 권한이 있으면 대상자와 요청내용을 입력해 요청한다", async () => {
    const user = userEvent.setup();
    const onRequestInfo = vi.fn();
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow()}
        loading={false}
        canRequest={false}
        canApproveResponsible
        canApproveTeamLead={false}
        canReject
        canRequestInfo
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onRequestInfo={onRequestInfo}
      />,
    );

    await user.click(screen.getByRole("button", { name: "추가정보 요청" }));
    const dialog = screen.getByRole("dialog", { name: "추가정보 요청" });
    await user.click(
      within(dialog).getByRole("combobox", { name: "요청 대상자" }),
    );
    await user.click(
      await screen.findByRole("option", { name: "정지은 매니저" }),
    );
    await user.type(
      within(dialog).getByLabelText("요청 내용"),
      "사업자번호 확인 필요",
    );
    await user.click(within(dialog).getByRole("button", { name: "요청하기" }));

    expect(onRequestInfo).toHaveBeenCalledWith({
      note: "사업자번호 확인 필요",
      targetId: "cs-manager",
    });
  });

  it("추가정보 요청 상태에서는 전용 배지를 보여주고, 대상자는 정보 제공 버튼을 쓸 수 있다", async () => {
    const user = userEvent.setup();
    const onProvideInfo = vi.fn();
    render(
      <ApprovalWorkflowPanel
        workflow={makeWorkflow({
          stage: "information_required",
          resumeStage: "manager_requested",
          pendingInfoTargetId: "cs-manager",
        })}
        loading={false}
        canRequest={false}
        canApproveResponsible={false}
        canApproveTeamLead={false}
        canReject={false}
        canProvideInfo
        requestLabel="이관 요청"
        onApprove={vi.fn()}
        onReject={vi.fn()}
        onProvideInfo={onProvideInfo}
      />,
    );

    expect(screen.getByText(/추가정보 요청됨/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "정보 제공" }));
    const dialog = screen.getByRole("dialog", { name: "정보 제공" });
    await user.type(
      within(dialog).getByLabelText("요청받은 추가정보"),
      "확인 완료",
    );
    await user.click(within(dialog).getByRole("button", { name: "제출하기" }));

    expect(onProvideInfo).toHaveBeenCalledWith("확인 완료");
  });
});
