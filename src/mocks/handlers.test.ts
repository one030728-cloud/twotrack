import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  resetInstallsForTest,
  resetReceiptsForTest,
  resetWorkflowsForTest,
} from "./handlers";
import type { FranchiseReceipt } from "@/features/franchise-receipts/types";
import type { InstallRecord } from "@/features/installations/types";
import type { ApprovalWorkflow } from "@/features/workflow/types";

// 실제 서비스는 빈 목록에서 시작하므로(mock-data.ts의 createInitial*), 아래 테스트들이
// 전제하는 목업 픽스처 상태를 매 테스트 시작 전에 명시적으로 시딩한다.
beforeEach(() => {
  resetReceiptsForTest();
  resetInstallsForTest();
});

describe("MSW handlers", () => {
  it("intercepts GET /api/health", async () => {
    const res = await fetch("/api/health");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ status: "ok" });
  });
});

describe("franchise-receipts handlers", () => {
  afterEach(() => {
    resetReceiptsForTest();
    resetInstallsForTest();
  });

  it("GET /api/franchise-receipts는 18건의 목록을 반환한다", async () => {
    const res = await fetch("/api/franchise-receipts");
    expect(res.status).toBe(200);
    const data = (await res.json()) as FranchiseReceipt[];
    expect(data).toHaveLength(18);
  });

  it("GET /api/franchise-receipts/kpis는 KPI 목록을 반환한다", async () => {
    const res = await fetch("/api/franchise-receipts/kpis");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual(
      expect.arrayContaining([expect.objectContaining({ key: "today" })]),
    );
  });

  it("POST /api/franchise-receipts는 새 항목을 목록 맨 앞에 추가한다", async () => {
    const res = await fetch("/api/franchise-receipts", {
      method: "POST",
      body: JSON.stringify({
        name: "테스트 상점",
        owner: "홍길동",
        phone: "010-0000-0000",
        channel: "토스리드건",
        bizType: "개인 사업자",
        salesRep: "임의 등록자",
      }),
    });
    expect(res.status).toBe(201);
    const created = (await res.json()) as FranchiseReceipt;
    expect(created.name).toBe("테스트 상점");
    expect(created.status).toBe("wait");
    expect(created.unassigned).toBe(true);
    expect(created.salesRep).toBe("서지은");

    const listRes = await fetch("/api/franchise-receipts");
    const list = (await listRes.json()) as FranchiseReceipt[];
    expect(list).toHaveLength(19);
    expect(list[0].id).toBe(created.id);
  });

  it("PATCH /api/franchise-receipts/:id는 지정한 필드만 갱신한다", async () => {
    const res = await fetch("/api/franchise-receipts/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "done", csRep: "서지은" }),
    });
    expect(res.status).toBe(200);
    const updated = (await res.json()) as FranchiseReceipt;
    expect(updated.status).toBe("done");
    expect(updated.csRep).toBe("서지은");
    expect(updated.unassigned).toBe(false);
    expect(updated.name).toBe("카페 아모르");
  });

  it("존재하지 않는 id를 PATCH하면 404를 반환한다", async () => {
    const res = await fetch("/api/franchise-receipts/9999", {
      method: "PATCH",
      body: JSON.stringify({ status: "done" }),
    });
    expect(res.status).toBe(404);
  });

  it("POST /api/franchise-receipts/:id/transfer-install은 설치관리 작업을 생성하고 접수를 이관 상태로 갱신한다", async () => {
    const res = await fetch("/api/franchise-receipts/1/transfer-install", {
      method: "POST",
    });

    expect(res.status).toBe(201);
    const data = (await res.json()) as {
      receipt: FranchiseReceipt;
      install: InstallRecord;
    };
    expect(data.receipt).toEqual(
      expect.objectContaining({ id: 1, status: "techWait", stage: 2 }),
    );
    expect(data.install).toEqual(
      expect.objectContaining({
        kind: "install",
        customerName: data.receipt.name,
        source: "franchise",
        sourceReceiptId: 1,
        registeredBy: "가맹접수 연동",
      }),
    );

    const listRes = await fetch("/api/installs");
    const list = (await listRes.json()) as InstallRecord[];
    expect(list[0].sourceReceiptId).toBe(1);
  });
});

describe("install handlers", () => {
  afterEach(() => resetInstallsForTest());

  it("GET /api/installs는 설치/택배/AS mock 목록을 반환한다", async () => {
    const res = await fetch("/api/installs");
    expect(res.status).toBe(200);
    const data = (await res.json()) as InstallRecord[];

    expect(data).toHaveLength(12);
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          kind: "install",
          source: "franchise",
        }),
        expect.objectContaining({ id: 10, kind: "as", source: "manual" }),
      ]),
    );
  });

  it("POST /api/installs는 직접 등록 건을 목록 맨 앞에 추가한다", async () => {
    const res = await fetch("/api/installs", {
      method: "POST",
      body: JSON.stringify({
        kind: "parcel",
        customerName: "테스트 배송",
        phone: "010-1111-2222",
        trackingNo: "CJ 1234567890",
        memo: "빠른 발송 요청",
      }),
    });

    expect(res.status).toBe(201);
    const created = (await res.json()) as InstallRecord;
    expect(created).toEqual(
      expect.objectContaining({
        id: 13,
        kind: "parcel",
        customerName: "테스트 배송",
        status: "receipt",
        source: "manual",
        registeredBy: "직접 등록",
        memo: "빠른 발송 요청",
      }),
    );

    const listRes = await fetch("/api/installs");
    const list = (await listRes.json()) as InstallRecord[];
    expect(list).toHaveLength(13);
    expect(list[0].id).toBe(created.id);
  });

  it("POST /api/installs는 요청의 등록자 값을 무시하고 자동 등록자를 사용한다", async () => {
    const res = await fetch("/api/installs", {
      method: "POST",
      body: JSON.stringify({
        kind: "install",
        customerName: "등록자 무시 테스트",
        phone: "010-3333-4444",
        registeredBy: "임의 등록자",
      }),
    });

    const created = (await res.json()) as InstallRecord;
    expect(created.registeredBy).toBe("직접 등록");
  });

  it("PATCH /api/installs/:id는 지정한 필드만 갱신한다", async () => {
    const res = await fetch("/api/installs/4", {
      method: "PATCH",
      body: JSON.stringify({ status: "scheduled", assignedTech: "박기사" }),
    });

    expect(res.status).toBe(200);
    const updated = (await res.json()) as InstallRecord;
    expect(updated.status).toBe("scheduled");
    expect(updated.assignedTech).toBe("박기사");
    expect(updated.customerName).toBe("명동떡볶이 본점");
  });

  it("DELETE /api/installs/:id는 직접 등록 건만 삭제한다", async () => {
    const manualDelete = await fetch("/api/installs/4", { method: "DELETE" });
    expect(manualDelete.status).toBe(204);

    const listRes = await fetch("/api/installs");
    const list = (await listRes.json()) as InstallRecord[];
    expect(list.some((record) => record.id === 4)).toBe(false);

    const linkedDelete = await fetch("/api/installs/1", { method: "DELETE" });
    expect(linkedDelete.status).toBe(403);

    const missingDelete = await fetch("/api/installs/9999", {
      method: "DELETE",
    });
    expect(missingDelete.status).toBe(404);
  });
});

describe("승인 워크플로우 handlers", () => {
  afterEach(() => {
    resetReceiptsForTest();
    resetInstallsForTest();
    resetWorkflowsForTest();
  });

  it("매니저→책임매니저→팀장 순서로 승인하면 이관이 완료된다", async () => {
    const requestRes = await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 1,
        actorId: "cs-manager",
      }),
    });
    expect(requestRes.status).toBe(201);
    const created = (await requestRes.json()) as ApprovalWorkflow;
    expect(created.stage).toBe("manager_requested");

    const approve1 = await fetch(`/api/workflows/${created.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ actorId: "cs-responsible" }),
    });
    expect(approve1.status).toBe(200);
    const afterResponsible = (await approve1.json()) as ApprovalWorkflow;
    expect(afterResponsible.stage).toBe("responsible_approved");

    const approve2 = await fetch(`/api/workflows/${created.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ actorId: "cs-lead" }),
    });
    expect(approve2.status).toBe(200);
    const final = (await approve2.json()) as ApprovalWorkflow;
    expect(final.stage).toBe("team_lead_approved");

    const receiptRes = await fetch("/api/franchise-receipts");
    const receipts = (await receiptRes.json()) as FranchiseReceipt[];
    const receipt = receipts.find((r) => r.id === 1);
    expect(receipt?.status).toBe("techWait");

    const installRes = await fetch("/api/installs");
    const installs = (await installRes.json()) as InstallRecord[];
    expect(
      installs.some((i) => i.source === "franchise" && i.sourceReceiptId === 1),
    ).toBe(true);
  });

  it("본인이 요청한 건은 본인이 승인할 수 없다", async () => {
    const requestRes = await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 2,
        actorId: "cs-manager",
      }),
    });
    const created = (await requestRes.json()) as ApprovalWorkflow;

    const selfApprove = await fetch(`/api/workflows/${created.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ actorId: "cs-manager" }),
    });
    expect(selfApprove.status).toBe(403);
  });

  it("다른 팀(도메인) 직책 보유자는 승인할 수 없다", async () => {
    const requestRes = await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 3,
        actorId: "cs-manager",
      }),
    });
    const created = (await requestRes.json()) as ApprovalWorkflow;

    const wrongPosition = await fetch(`/api/workflows/${created.id}/approve`, {
      method: "POST",
      body: JSON.stringify({ actorId: "tech-responsible" }),
    });
    expect(wrongPosition.status).toBe(403);
  });

  it("반려 시 사유와 함께 이력이 남고, 재요청 시 새 워크플로우가 만들어진다", async () => {
    const requestRes = await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 4,
        actorId: "cs-manager",
      }),
    });
    const created = (await requestRes.json()) as ApprovalWorkflow;

    const rejectRes = await fetch(`/api/workflows/${created.id}/reject`, {
      method: "POST",
      body: JSON.stringify({ actorId: "cs-responsible", reason: "서류 누락" }),
    });
    expect(rejectRes.status).toBe(200);
    const rejected = (await rejectRes.json()) as ApprovalWorkflow;
    expect(rejected.stage).toBe("rejected");
    expect(rejected.history.at(-1)?.comment).toBe("서류 누락");

    const reRequestRes = await fetch("/api/workflows", {
      method: "POST",
      body: JSON.stringify({
        kind: "franchise_transfer",
        entityId: 4,
        actorId: "cs-manager",
      }),
    });
    expect(reRequestRes.status).toBe(201);
    const reRequested = (await reRequestRes.json()) as ApprovalWorkflow;
    expect(reRequested.id).not.toBe(created.id);
    expect(reRequested.stage).toBe("manager_requested");
  });
});
