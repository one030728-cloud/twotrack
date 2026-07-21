import { http, HttpResponse } from "msw";
import type { AppNotification } from "@/types/notification";
import type {
  CreateReceiptInput,
  FranchiseReceipt,
} from "@/features/franchise-receipts/types";
import {
  createInitialReceipts,
  RECEIPT_KPIS,
} from "@/features/franchise-receipts/api/mock-data";
import type {
  CreateInstallInput,
  InstallRecord,
  PendingCompletion,
} from "@/features/installations/types";
import { createInitialInstalls } from "@/features/installations/api/mock-data";
import { MOCK_USERS, type PositionCode } from "@/features/auth/permissions";
import {
  domainForKind,
  type ApprovalWorkflow,
  type WorkflowActionEntry,
  type WorkflowKind,
  type WorkflowStage,
} from "@/features/workflow/types";

const initialNotifications: AppNotification[] = [
  {
    id: "1",
    message: "카페 아모르 서류 미제출 안내가 발송되었습니다.",
    link: "/franchise-receipts",
    read: false,
    createdAt: "2026-07-14T08:10:00+09:00",
  },
  {
    id: "2",
    message: "소녀코리아마스터링 사업자등록증 재제출이 필요합니다.",
    link: "/franchise-receipts",
    read: false,
    createdAt: "2026-07-14T07:40:00+09:00",
  },
  {
    id: "3",
    message: "삼겹담 신정점 심사가 완료 처리되었습니다.",
    link: "/franchise-receipts",
    read: false,
    createdAt: "2026-07-13T22:05:00+09:00",
  },
  {
    id: "4",
    message: "대국민푸드 건이 기술지원팀에 배정 대기 중입니다.",
    link: "/franchise-receipts",
    read: false,
    createdAt: "2026-07-13T14:30:00+09:00",
  },
  {
    id: "5",
    message: "행복한 카페 설치가 완료되었습니다.",
    link: "/franchise-receipts",
    read: false,
    createdAt: "2026-07-12T09:00:00+09:00",
  },
  {
    id: "6",
    message: "명동떡볶이 본점 접수가 등록되었습니다.",
    link: "/franchise-receipts",
    read: true,
    createdAt: "2026-07-11T11:20:00+09:00",
  },
];

let notifications: AppNotification[] = initialNotifications.map((n) => ({
  ...n,
}));

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetNotificationsForTest() {
  notifications = initialNotifications.map((n) => ({ ...n }));
}

let receipts: FranchiseReceipt[] = createInitialReceipts();

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetReceiptsForTest() {
  receipts = createInitialReceipts();
}

let installs: InstallRecord[] = createInitialInstalls();

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetInstallsForTest() {
  installs = createInitialInstalls();
}

let workflows: ApprovalWorkflow[] = [];

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetWorkflowsForTest() {
  workflows = [];
}

/** 가맹 접수 건을 기술지원팀 설치관리로 이관하는 부수효과. 승인 워크플로우의 팀장 최종수락 시 호출된다. */
function performFranchiseTransfer(id: number) {
  const target = receipts.find((r) => r.id === id);
  if (!target) return null;

  const transferredReceipt: FranchiseReceipt = {
    ...target,
    status: "techWait",
    stage: Math.max(target.stage, 2),
    memoHistory: [
      ...target.memoHistory,
      {
        id: `memo-${id}-transfer-${Date.now()}`,
        meta: new Date().toISOString().slice(0, 10),
        content: "기술지원 이관으로 설치관리 작업이 생성되었습니다.",
        pinned: false,
      },
    ],
  };
  receipts = receipts.map((r) => (r.id === id ? transferredReceipt : r));

  const existing = installs.find(
    (install) =>
      install.source === "franchise" && install.sourceReceiptId === id,
  );
  if (existing) {
    return { receipt: transferredReceipt, install: existing };
  }

  const nextId = installs.reduce((max, r) => Math.max(max, r.id), 0) + 1;
  const now = new Date().toISOString();
  const created: InstallRecord = {
    id: nextId,
    kind: "install",
    customerName: target.name,
    phone: target.phone,
    address: "",
    addressDetail: "",
    product: "",
    status: "receipt",
    assignedTech: null,
    trackingNo: null,
    scheduledDate: null,
    timeSlot: null,
    symptom: "",
    registeredBy: "가맹접수 연동",
    registeredAt: now,
    source: "franchise",
    sourceReceiptId: id,
    memo: target.memo,
    notiHistory: [
      {
        id: `noti-${nextId}-transfer`,
        label: `${now.slice(0, 10)} · 가맹 접수에서 기술지원 이관`,
      },
    ],
    requestMemo: target.memo,
    planMemo: "",
    plannedDevices: [],
    deviceResults: [],
    attachments: [],
    completionPhotoMissingReason: "",
    resultMemo: "",
    completedAt: null,
    storeWorkHistory: [],
    pendingCompletion: null,
  };
  installs = [created, ...installs];

  return { receipt: transferredReceipt, install: created };
}

/** 설치/AS 완료요청 시 보관해둔 pendingCompletion을 실제 완료 상태로 확정하는 부수효과. */
function performInstallCompletion(id: number) {
  const target = installs.find((r) => r.id === id);
  if (!target || !target.pendingCompletion) return null;

  const COMPLETED_STATUS: Record<
    InstallRecord["kind"],
    InstallRecord["status"]
  > = {
    install: "installDone",
    parcel: "received",
    as: "asDone",
  };

  const pending = target.pendingCompletion;
  const now = new Date().toISOString();
  const updated: InstallRecord = {
    ...target,
    status: COMPLETED_STATUS[target.kind],
    completedAt: now,
    resultMemo: pending.resultMemo,
    completionPhotoMissingReason: pending.completionPhotoMissingReason,
    deviceResults: pending.deviceResults,
    attachments: pending.attachments,
    storeWorkHistory: [
      ...(target.storeWorkHistory ?? []),
      { id: `history-${id}-${Date.now()}`, label: pending.historyLabel },
    ],
    pendingCompletion: null,
  };
  installs = installs.map((r) => (r.id === id ? updated : r));
  return updated;
}

const REQUIRED_POSITION_BY_STAGE: Record<
  "manager_requested" | "responsible_approved",
  PositionCode
> = {
  manager_requested: "responsible_manager",
  responsible_approved: "team_lead",
};

function findLatestWorkflow(kind: WorkflowKind, entityId: number) {
  return workflows
    .filter((w) => w.kind === kind && w.entityId === entityId)
    .sort((a, b) => b.requestedAt.localeCompare(a.requestedAt))[0];
}

export const handlers = [
  http.get("/api/health", () => {
    return HttpResponse.json({ status: "ok" });
  }),

  http.get("/api/notifications", () => {
    return HttpResponse.json(notifications);
  }),

  http.patch("/api/notifications/:id/read", ({ params }) => {
    const { id } = params;
    const target = notifications.find((n) => n.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    return HttpResponse.json({ ...target, read: true });
  }),

  http.post("/api/notifications/read-all", () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    return HttpResponse.json(notifications);
  }),

  http.get("/api/franchise-receipts", () => {
    return HttpResponse.json(receipts);
  }),

  http.get("/api/franchise-receipts/kpis", () => {
    return HttpResponse.json(RECEIPT_KPIS);
  }),

  http.post("/api/franchise-receipts", async ({ request }) => {
    const input = (await request.json()) as CreateReceiptInput;
    const nextId = receipts.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const created: FranchiseReceipt = {
      id: nextId,
      receiptDate: input.receiptDate ?? new Date().toISOString().slice(0, 10),
      channel: input.channel ?? null,
      bizType: input.bizType ?? null,
      name: input.name,
      owner: input.owner,
      phone: input.phone,
      bizNo: input.bizNo ?? "000-00-00000",
      salesRep: "서지은",
      csRep: input.csRep ?? null,
      internet: input.internet ?? null,
      status: input.status ?? "wait",
      stage: 0,
      due: input.due ?? "",
      memo: input.memo ?? "",
      memoHistory: input.memoHistory ?? [],
      isMine: input.isMine ?? true,
      unassigned: !input.csRep,
    };
    receipts = [created, ...receipts];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/franchise-receipts/:id/transfer-install", ({ params }) => {
    const id = Number(params.id);
    const result = performFranchiseTransfer(id);
    if (!result) {
      return new HttpResponse(null, { status: 404 });
    }
    return HttpResponse.json(result, { status: 201 });
  }),

  http.patch("/api/franchise-receipts/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = receipts.find((r) => r.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as Partial<FranchiseReceipt>;
    const updated: FranchiseReceipt = {
      ...target,
      ...patch,
      unassigned: patch.csRep !== undefined ? !patch.csRep : target.unassigned,
    };
    receipts = receipts.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),

  http.get("/api/installs", () => {
    return HttpResponse.json(installs);
  }),

  http.post("/api/installs", async ({ request }) => {
    const input = (await request.json()) as CreateInstallInput;
    const nextId = installs.reduce((max, r) => Math.max(max, r.id), 0) + 1;
    const created: InstallRecord = {
      id: nextId,
      kind: input.kind,
      customerName: input.customerName,
      phone: input.phone,
      address: input.address ?? "",
      addressDetail: input.addressDetail ?? "",
      product: input.product ?? "",
      status: "receipt",
      assignedTech: input.assignedTech ?? null,
      trackingNo: input.trackingNo ?? null,
      scheduledDate: input.scheduledDate ?? null,
      timeSlot: input.timeSlot ?? null,
      symptom: input.symptom ?? "",
      registeredBy: "직접 등록",
      registeredAt: new Date().toISOString(),
      source: "manual",
      memo: input.memo ?? "",
      notiHistory: [],
      requestMemo: input.requestMemo ?? input.memo ?? "",
      planMemo: input.planMemo ?? "",
      plannedDevices: input.plannedDevices ?? [],
      deviceResults: [],
      attachments: input.attachments ?? [],
      completionPhotoMissingReason: "",
      resultMemo: "",
      completedAt: null,
      storeWorkHistory: [],
      pendingCompletion: null,
    };
    installs = [created, ...installs];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/installs/:id", async ({ params, request }) => {
    const id = Number(params.id);
    const target = installs.find((r) => r.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as Partial<InstallRecord>;
    const updated: InstallRecord = { ...target, ...patch };
    installs = installs.map((r) => (r.id === id ? updated : r));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/installs/:id", ({ params }) => {
    const id = Number(params.id);
    const target = installs.find((r) => r.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    if (target.source === "franchise") {
      return new HttpResponse(null, { status: 403 });
    }
    installs = installs.filter((r) => r.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/workflows", ({ request }) => {
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind") as WorkflowKind | null;
    const entityId = Number(url.searchParams.get("entityId"));
    if (!kind || !entityId) {
      return new HttpResponse(null, { status: 400 });
    }
    return HttpResponse.json(findLatestWorkflow(kind, entityId) ?? null);
  }),

  http.post("/api/workflows", async ({ request }) => {
    const body = (await request.json()) as {
      kind: WorkflowKind;
      entityId: number;
      actorId: string;
      payload?: PendingCompletion;
    };
    const actor = MOCK_USERS.find((u) => u.id === body.actorId);
    const domain = domainForKind(body.kind);
    if (
      !actor ||
      actor.role !== domain ||
      !actor.positions.includes("manager")
    ) {
      return new HttpResponse(null, { status: 403 });
    }
    const existing = findLatestWorkflow(body.kind, body.entityId);
    if (existing && existing.stage !== "rejected") {
      return HttpResponse.json(existing);
    }

    if (body.kind === "install_completion" && body.payload) {
      installs = installs.map((r) =>
        r.id === body.entityId
          ? { ...r, pendingCompletion: body.payload ?? null }
          : r,
      );
    }

    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: "request",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: "manager",
      comment: "",
      createdAt: now,
    };
    const created: ApprovalWorkflow = {
      id: `wf-${Date.now()}`,
      kind: body.kind,
      domain,
      entityId: body.entityId,
      stage: "manager_requested",
      requestedBy: actor.id,
      requestedByName: actor.name,
      requestedAt: now,
      history: [entry],
    };
    workflows = [created, ...workflows];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/workflows/:id/approve", async ({ params, request }) => {
    const id = params.id as string;
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as {
      actorId: string;
      comment?: string;
    };
    const actor = MOCK_USERS.find((u) => u.id === body.actorId);
    const requiredPosition =
      REQUIRED_POSITION_BY_STAGE[
        workflow.stage as "manager_requested" | "responsible_approved"
      ];
    if (
      !actor ||
      !requiredPosition ||
      actor.role !== workflow.domain ||
      !actor.positions.includes(requiredPosition) ||
      actor.id === workflow.requestedBy
    ) {
      return new HttpResponse(null, { status: 403 });
    }

    const nextStage: WorkflowStage =
      workflow.stage === "manager_requested"
        ? "responsible_approved"
        : "team_lead_approved";
    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action:
        workflow.stage === "manager_requested"
          ? "responsible_approve"
          : "team_lead_approve",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: requiredPosition,
      comment: body.comment ?? "",
      createdAt: now,
    };
    const updated: ApprovalWorkflow = {
      ...workflow,
      stage: nextStage,
      history: [...workflow.history, entry],
    };
    workflows = workflows.map((w) => (w.id === id ? updated : w));

    if (nextStage === "team_lead_approved") {
      if (workflow.kind === "franchise_transfer") {
        performFranchiseTransfer(workflow.entityId);
      } else {
        performInstallCompletion(workflow.entityId);
      }
    }

    return HttpResponse.json(updated);
  }),

  http.post("/api/workflows/:id/reject", async ({ params, request }) => {
    const id = params.id as string;
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as {
      actorId: string;
      reason: string;
    };
    const actor = MOCK_USERS.find((u) => u.id === body.actorId);
    const requiredPosition =
      REQUIRED_POSITION_BY_STAGE[
        workflow.stage as "manager_requested" | "responsible_approved"
      ];
    if (
      !actor ||
      !requiredPosition ||
      actor.role !== workflow.domain ||
      !actor.positions.includes(requiredPosition) ||
      actor.id === workflow.requestedBy ||
      !body.reason?.trim()
    ) {
      return new HttpResponse(null, { status: 403 });
    }

    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: "reject",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: requiredPosition,
      comment: body.reason,
      createdAt: now,
    };
    const updated: ApprovalWorkflow = {
      ...workflow,
      stage: "rejected",
      history: [...workflow.history, entry],
    };
    workflows = workflows.map((w) => (w.id === id ? updated : w));

    if (workflow.kind === "install_completion") {
      installs = installs.map((r) =>
        r.id === workflow.entityId ? { ...r, pendingCompletion: null } : r,
      );
    }

    return HttpResponse.json(updated);
  }),
];
