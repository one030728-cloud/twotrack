import { afterEach, describe, expect, it } from "vitest";
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
      await responsibleView.result.current.reject("사진 누락");
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
});
