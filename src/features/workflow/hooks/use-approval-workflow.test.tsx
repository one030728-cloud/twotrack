import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useApprovalWorkflow } from "./use-approval-workflow";
import { AUTH_STORAGE_KEY, AuthProvider } from "@/features/auth/auth-provider";
import { resetInstallsForTest, resetWorkflowsForTest } from "@/mocks/handlers";

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function loginAs(userId: string) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, userId);
}

beforeEach(() => {
  resetInstallsForTest();
});

afterEach(() => {
  resetWorkflowsForTest();
  resetInstallsForTest();
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
});

describe("useApprovalWorkflow", () => {
  it("설치완료 요청 이후, 책임매니저와 팀장이 순서대로 승인하면 완료 처리된다", async () => {
    loginAs("tech-manager");
    const managerView = renderHook(
      () => useApprovalWorkflow("install_completion", 1),
      { wrapper },
    );
    await waitFor(() => expect(managerView.result.current.loading).toBe(false));
    expect(managerView.result.current.canRequest).toBe(true);

    await act(async () => {
      await managerView.result.current.request({
        resultMemo: "정상 설치",
        completionPhotoMissingReason: "",
        deviceResults: [],
        attachments: [],
        historyLabel: "완료 처리 테스트",
      });
    });
    expect(managerView.result.current.workflow?.stage).toBe(
      "manager_requested",
    );
    managerView.unmount();

    loginAs("tech-responsible");
    const responsibleView = renderHook(
      () => useApprovalWorkflow("install_completion", 1),
      { wrapper },
    );
    await waitFor(() =>
      expect(responsibleView.result.current.loading).toBe(false),
    );
    expect(responsibleView.result.current.canApproveResponsible).toBe(true);
    await act(async () => {
      await responsibleView.result.current.approve();
    });
    expect(responsibleView.result.current.workflow?.stage).toBe(
      "responsible_approved",
    );
    responsibleView.unmount();

    loginAs("tech-lead");
    const leadView = renderHook(
      () => useApprovalWorkflow("install_completion", 1),
      { wrapper },
    );
    await waitFor(() => expect(leadView.result.current.loading).toBe(false));
    expect(leadView.result.current.canApproveTeamLead).toBe(true);
    await act(async () => {
      await leadView.result.current.approve();
    });
    expect(leadView.result.current.workflow?.stage).toBe("team_lead_approved");
    leadView.unmount();
  });

  it("반려 시 사유가 이력에 남고 재요청이 가능해진다", async () => {
    loginAs("tech-manager");
    const managerView = renderHook(
      () => useApprovalWorkflow("install_completion", 2),
      { wrapper },
    );
    await waitFor(() => expect(managerView.result.current.loading).toBe(false));
    await act(async () => {
      await managerView.result.current.request({
        resultMemo: "정상 설치",
        completionPhotoMissingReason: "",
        deviceResults: [],
        attachments: [],
        historyLabel: "완료 처리 테스트",
      });
    });
    managerView.unmount();

    loginAs("tech-responsible");
    const responsibleView = renderHook(
      () => useApprovalWorkflow("install_completion", 2),
      { wrapper },
    );
    await waitFor(() =>
      expect(responsibleView.result.current.loading).toBe(false),
    );
    await act(async () => {
      await responsibleView.result.current.reject({
        reason: "사진 누락",
        reprocessAssigneeId: "tech-manager",
        reprocessDueAt: "2026-07-25",
      });
    });
    expect(responsibleView.result.current.workflow?.stage).toBe("rejected");
    expect(
      responsibleView.result.current.workflow?.history.at(-1)?.comment,
    ).toBe("사진 누락");
    responsibleView.unmount();

    loginAs("tech-manager");
    const retryView = renderHook(
      () => useApprovalWorkflow("install_completion", 2),
      { wrapper },
    );
    await waitFor(() => expect(retryView.result.current.loading).toBe(false));
    expect(retryView.result.current.canRequest).toBe(true);
    retryView.unmount();
  });

  it("추가정보 요청을 받으면 대상자만 정보를 제공해 원래 단계로 되돌릴 수 있다", async () => {
    loginAs("tech-manager");
    const managerView = renderHook(
      () => useApprovalWorkflow("install_completion", 3),
      { wrapper },
    );
    await waitFor(() => expect(managerView.result.current.loading).toBe(false));
    await act(async () => {
      await managerView.result.current.request({
        resultMemo: "정상 설치",
        completionPhotoMissingReason: "",
        deviceResults: [],
        attachments: [],
        historyLabel: "완료 처리 테스트",
      });
    });
    managerView.unmount();

    loginAs("tech-responsible");
    const responsibleView = renderHook(
      () => useApprovalWorkflow("install_completion", 3),
      { wrapper },
    );
    await waitFor(() =>
      expect(responsibleView.result.current.loading).toBe(false),
    );
    expect(responsibleView.result.current.canRequestInfo).toBe(true);
    await act(async () => {
      await responsibleView.result.current.requestInfo({
        note: "완료 사진 확인 필요",
        targetId: "tech-manager",
      });
    });
    expect(responsibleView.result.current.workflow?.stage).toBe(
      "information_required",
    );
    responsibleView.unmount();

    loginAs("tech-manager");
    const managerRetry = renderHook(
      () => useApprovalWorkflow("install_completion", 3),
      { wrapper },
    );
    await waitFor(() =>
      expect(managerRetry.result.current.loading).toBe(false),
    );
    expect(managerRetry.result.current.canProvideInfo).toBe(true);
    await act(async () => {
      await managerRetry.result.current.provideInfo("사진 첨부 완료");
    });
    expect(managerRetry.result.current.workflow?.stage).toBe(
      "manager_requested",
    );
    managerRetry.unmount();
  });

  it("조건부 승인은 단계를 정상 진행시키고 보완 정보를 이력에 남긴다", async () => {
    loginAs("tech-manager");
    const managerView = renderHook(
      () => useApprovalWorkflow("install_completion", 4),
      { wrapper },
    );
    await waitFor(() => expect(managerView.result.current.loading).toBe(false));
    await act(async () => {
      await managerView.result.current.request({
        resultMemo: "정상 설치",
        completionPhotoMissingReason: "",
        deviceResults: [],
        attachments: [],
        historyLabel: "완료 처리 테스트",
      });
    });
    managerView.unmount();

    loginAs("tech-responsible");
    const responsibleView = renderHook(
      () => useApprovalWorkflow("install_completion", 4),
      { wrapper },
    );
    await waitFor(() =>
      expect(responsibleView.result.current.loading).toBe(false),
    );
    await act(async () => {
      await responsibleView.result.current.conditionalApprove({
        allowReason: "일정상 우선 진행",
        followUpNote: "부품 시리얼 재확인",
        followUpAssigneeId: "tech-manager",
        followUpDueAt: "2026-07-28",
      });
    });
    expect(responsibleView.result.current.workflow?.stage).toBe(
      "responsible_approved",
    );
    expect(
      responsibleView.result.current.workflow?.history.at(-1)?.action,
    ).toBe("conditional_approve");
    responsibleView.unmount();
  });
});
