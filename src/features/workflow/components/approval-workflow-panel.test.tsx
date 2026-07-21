import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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
        actorPosition: "manager",
        comment: "",
        createdAt: "2026-07-17T10:00:00.000Z",
      },
    ],
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
    expect(submit).not.toBeDisabled();
    await user.click(submit);
    expect(onReject).toHaveBeenCalledWith("서류 누락");
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
});
