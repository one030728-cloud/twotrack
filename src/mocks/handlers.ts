import { http, HttpResponse } from "msw";
import type { AppNotification } from "@/types/notification";
import type {
  CreateReceiptInput,
  FranchiseReceipt,
} from "@/features/franchise-receipts/types";
import {
  createFixtureReceipts,
  createInitialReceipts,
  RECEIPT_KPIS,
} from "@/features/franchise-receipts/api/mock-data";
import type {
  CreateInstallInput,
  InstallRecord,
  PendingCompletion,
} from "@/features/installations/types";
import {
  createFixtureInstalls,
  createInitialInstalls,
} from "@/features/installations/api/mock-data";
import type { AuthUser, PositionCode } from "@/features/auth/permissions";
import { createInitialEmployees } from "@/features/employees/api/mock-data";
import type {
  CreateEmployeeInput,
  EmployeeRecord,
  UpdateEmployeeInput,
} from "@/features/employees/types";
import {
  domainForKind,
  type ApprovalWorkflow,
  type WorkflowActionEntry,
  type WorkflowDomain,
  type WorkflowKind,
  type WorkflowStage,
} from "@/features/workflow/types";
import type {
  CreateMerchantInput,
  MerchantRecord,
  UpdateMerchantInput,
} from "@/features/merchants/types";
import {
  createFixtureMerchants,
  createInitialMerchants,
} from "@/features/merchants/api/mock-data";
import type {
  CalendarEvent,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/features/calendar/types";
import {
  createFixtureCalendarEvents,
  createInitialCalendarEvents,
} from "@/features/calendar/api/mock-data";
import type {
  CreateExternalTechInput,
  ExternalTechRecord,
  UpdateExternalTechInput,
} from "@/features/external-techs/types";
import {
  createFixtureExternalTechs,
  createInitialExternalTechs,
} from "@/features/external-techs/api/mock-data";
import type {
  CreateInventoryItemInput,
  InventoryItemRecord,
  RecordInventoryCountInput,
} from "@/features/inventory/types";
import {
  createFixtureInventoryItems,
  createInitialInventoryItems,
} from "@/features/inventory/api/mock-data";
import type {
  CreateTransferInput,
  TransferRecord,
  UpdateTransferInput,
} from "@/features/transfers/types";
import {
  createFixtureTransfers,
  createInitialTransfers,
} from "@/features/transfers/api/mock-data";
import type {
  ChatMessage,
  CreateChatMessageInput,
} from "@/features/chat/types";
import {
  createFixtureChatMessages,
  createInitialChatMessages,
} from "@/features/chat/api/mock-data";
import type {
  ContractRecord,
  CreateContractInput,
  UpdateContractInput,
} from "@/features/contracts/types";
import {
  createFixtureContracts,
  createInitialContracts,
} from "@/features/contracts/api/mock-data";
import type {
  CreateSlackMessageInput,
  SlackMessageRecord,
} from "@/features/slack/types";
import {
  createFixtureSlackMessages,
  createInitialSlackMessages,
} from "@/features/slack/api/mock-data";
import { asArray, loadPersistedDb, savePersistedDb } from "./persisted-store";

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
const NOTIFICATION_FIXTURES: AppNotification[] = [
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

/** 새로고침 시 이전 세션에서 저장된 목업 데이터가 있으면 그 값으로 시작한다. */
const persisted = loadPersistedDb();

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
let notifications: AppNotification[] = asArray(
  persisted.notifications,
  () => [],
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetNotificationsForTest() {
  notifications = NOTIFICATION_FIXTURES.map((n) => ({ ...n }));
}

let receipts: FranchiseReceipt[] = asArray(
  persisted.receipts,
  createInitialReceipts,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetReceiptsForTest() {
  receipts = createFixtureReceipts();
}

let installs: InstallRecord[] = asArray(
  persisted.installs,
  createInitialInstalls,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetInstallsForTest() {
  installs = createFixtureInstalls();
}

let workflows: ApprovalWorkflow[] = asArray(persisted.workflows, () => []);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetWorkflowsForTest() {
  workflows = [];
}

let employees: EmployeeRecord[] = asArray(
  persisted.employees,
  createInitialEmployees,
);

/** password는 mock 저장소 내부에만 두고 클라이언트 응답에서는 제외한다. */
function toPublicEmployee(record: EmployeeRecord): AuthUser {
  return {
    id: record.id,
    name: record.name,
    team: record.team,
    role: record.role,
    positions: record.positions,
    active: record.active,
    username: record.username,
  };
}

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetEmployeesForTest() {
  employees = createInitialEmployees();
}

let merchants: MerchantRecord[] = asArray(
  persisted.merchants,
  createInitialMerchants,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetMerchantsForTest() {
  merchants = createFixtureMerchants();
}

let calendarEvents: CalendarEvent[] = asArray(
  persisted.calendarEvents,
  createInitialCalendarEvents,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetCalendarEventsForTest() {
  calendarEvents = createFixtureCalendarEvents();
}

let externalTechs: ExternalTechRecord[] = asArray(
  persisted.externalTechs,
  createInitialExternalTechs,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetExternalTechsForTest() {
  externalTechs = createFixtureExternalTechs();
}

let inventoryItems: InventoryItemRecord[] = asArray(
  persisted.inventoryItems,
  createInitialInventoryItems,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetInventoryForTest() {
  inventoryItems = createFixtureInventoryItems();
}

let transfers: TransferRecord[] = asArray(
  persisted.transfers,
  createInitialTransfers,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetTransfersForTest() {
  transfers = createFixtureTransfers();
}

let chatMessages: ChatMessage[] = asArray(
  persisted.chatMessages,
  createInitialChatMessages,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetChatMessagesForTest() {
  chatMessages = createFixtureChatMessages();
}

let contracts: ContractRecord[] = asArray(
  persisted.contracts,
  createInitialContracts,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetContractsForTest() {
  contracts = createFixtureContracts();
}

let slackMessages: SlackMessageRecord[] = asArray(
  persisted.slackMessages,
  createInitialSlackMessages,
);

/** 테스트에서 mock 데이터 상태를 시드 값으로 되돌리기 위한 헬퍼. 프로덕션 코드에서는 사용하지 않는다. */
export function resetSlackMessagesForTest() {
  slackMessages = createFixtureSlackMessages();
}

/** 상태 변경 후 호출해 localStorage 스냅샷을 갱신한다. 새로고침 후에도 데이터가 유지되도록 한다. */
function persistMockDb() {
  savePersistedDb({
    notifications,
    receipts,
    installs,
    workflows,
    employees,
    merchants,
    calendarEvents,
    externalTechs,
    inventoryItems,
    transfers,
    chatMessages,
    contracts,
    slackMessages,
  });
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
  persistMockDb();

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
  persistMockDb();

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
  persistMockDb();
  return updated;
}

/** 요청 단계에서 필요한 직책. master는 어느 도메인이든 대행 가능하다. */
function positionsForRequest(domain: WorkflowDomain): PositionCode[] {
  return domain === "cs"
    ? ["cs_manager", "master"]
    : ["tech_manager", "master"];
}

/** 책임매니저 승인 단계에서 필요한 직책. */
function positionsForResponsibleApprove(
  domain: WorkflowDomain,
): PositionCode[] {
  return domain === "cs"
    ? ["cs_responsible", "master"]
    : ["tech_responsible", "master"];
}

/** 팀장 최종수락 단계는 도메인과 무관하게 공통 팀장 직책이 담당한다. */
function positionsForTeamLeadApprove(): PositionCode[] {
  return ["team_lead", "master"];
}

function positionsForStage(
  stage: "manager_requested" | "responsible_approved",
  domain: WorkflowDomain,
): PositionCode[] {
  return stage === "manager_requested"
    ? positionsForResponsibleApprove(domain)
    : positionsForTeamLeadApprove();
}

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
    persistMockDb();
    return HttpResponse.json({ ...target, read: true });
  }),

  http.post("/api/notifications/read-all", () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    persistMockDb();
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
    persistMockDb();
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
    persistMockDb();
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
    persistMockDb();
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
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/installs/:id", ({ params }) => {
    const id = Number(params.id);
    const target = installs.find((r) => r.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    installs = installs.filter((r) => r.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/workflows/all", () => {
    return HttpResponse.json(
      [...workflows].sort((a, b) => b.requestedAt.localeCompare(a.requestedAt)),
    );
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
    const actor = employees.find((u) => u.id === body.actorId);
    const domain = domainForKind(body.kind);
    const allowedPositions = positionsForRequest(domain);
    const matchedPosition = actor?.positions.find((p) =>
      allowedPositions.includes(p),
    );
    if (!actor || !matchedPosition) {
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
      actorPosition: matchedPosition,
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
      resumeStage: null,
      pendingInfoTargetId: null,
    };
    workflows = [created, ...workflows];
    persistMockDb();
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
      conditional?: boolean;
      followUpNote?: string;
      followUpAssigneeId?: string;
      followUpDueAt?: string;
    };
    const actor = employees.find((u) => u.id === body.actorId);
    const allowedPositions =
      workflow.stage === "manager_requested" ||
      workflow.stage === "responsible_approved"
        ? positionsForStage(workflow.stage, workflow.domain)
        : null;
    const matchedPosition = actor?.positions.find((p) =>
      allowedPositions?.includes(p),
    );
    if (
      !actor ||
      !allowedPositions ||
      !matchedPosition ||
      actor.id === workflow.requestedBy
    ) {
      return new HttpResponse(null, { status: 403 });
    }
    // 조건부 수락(7.3)은 보완사항·보완 담당자·보완기한·진행 허용 사유를 모두 요구한다.
    if (
      body.conditional &&
      (!body.followUpNote?.trim() ||
        !body.followUpAssigneeId ||
        !body.followUpDueAt ||
        !body.comment?.trim())
    ) {
      return new HttpResponse(null, { status: 400 });
    }
    const followUpAssignee = body.conditional
      ? employees.find((u) => u.id === body.followUpAssigneeId)
      : undefined;
    if (body.conditional && !followUpAssignee) {
      return new HttpResponse(null, { status: 400 });
    }

    const nextStage: WorkflowStage =
      workflow.stage === "manager_requested"
        ? "responsible_approved"
        : "team_lead_approved";
    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: body.conditional
        ? "conditional_approve"
        : workflow.stage === "manager_requested"
          ? "responsible_approve"
          : "team_lead_approve",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: matchedPosition,
      comment: body.comment ?? "",
      createdAt: now,
      ...(body.conditional
        ? {
            followUpNote: body.followUpNote,
            followUpAssigneeId: followUpAssignee?.id,
            followUpAssigneeName: followUpAssignee?.name,
            followUpDueAt: body.followUpDueAt,
          }
        : {}),
    };
    const updated: ApprovalWorkflow = {
      ...workflow,
      stage: nextStage,
      history: [...workflow.history, entry],
    };
    workflows = workflows.map((w) => (w.id === id ? updated : w));
    persistMockDb();

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
      reprocessAssigneeId: string;
      reprocessDueAt: string;
    };
    const actor = employees.find((u) => u.id === body.actorId);
    const allowedPositions =
      workflow.stage === "manager_requested" ||
      workflow.stage === "responsible_approved"
        ? positionsForStage(workflow.stage, workflow.domain)
        : null;
    const matchedPosition = actor?.positions.find((p) =>
      allowedPositions?.includes(p),
    );
    // 반려(7.4)는 반려 사유·재처리 담당자·재처리기한을 모두 요구한다.
    // 반려 대상 단계는 현재 결재선 구조상 항상 최초 처리 단계(요청 이전)로 고정된다.
    const reprocessAssignee = employees.find(
      (u) => u.id === body.reprocessAssigneeId,
    );
    if (
      !actor ||
      !allowedPositions ||
      !matchedPosition ||
      actor.id === workflow.requestedBy ||
      !body.reason?.trim() ||
      !reprocessAssignee ||
      !body.reprocessDueAt
    ) {
      return new HttpResponse(null, { status: 403 });
    }

    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: "reject",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: matchedPosition,
      comment: body.reason,
      createdAt: now,
      reprocessAssigneeId: reprocessAssignee.id,
      reprocessAssigneeName: reprocessAssignee.name,
      reprocessDueAt: body.reprocessDueAt,
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
    persistMockDb();

    return HttpResponse.json(updated);
  }),

  // 추가정보 요청(7.5): 현재 단계의 승인 권한자가 요청하며, 응답 전까지 승인 SLA를 정지한다.
  http.post("/api/workflows/:id/request-info", async ({ params, request }) => {
    const id = params.id as string;
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as {
      actorId: string;
      note: string;
      targetId: string;
    };
    const actor = employees.find((u) => u.id === body.actorId);
    const allowedPositions =
      workflow.stage === "manager_requested" ||
      workflow.stage === "responsible_approved"
        ? positionsForStage(workflow.stage, workflow.domain)
        : null;
    const matchedPosition = actor?.positions.find((p) =>
      allowedPositions?.includes(p),
    );
    const target = employees.find((u) => u.id === body.targetId);
    if (
      !actor ||
      !allowedPositions ||
      !matchedPosition ||
      actor.id === workflow.requestedBy ||
      !target ||
      !body.note?.trim()
    ) {
      return new HttpResponse(null, { status: 403 });
    }

    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: "request_info",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: matchedPosition,
      comment: body.note,
      createdAt: now,
      infoRequestTargetId: target.id,
      infoRequestTargetName: target.name,
    };
    const updated: ApprovalWorkflow = {
      ...workflow,
      stage: "information_required",
      resumeStage: workflow.stage,
      pendingInfoTargetId: target.id,
      history: [...workflow.history, entry],
    };
    workflows = workflows.map((w) => (w.id === id ? updated : w));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  // 정보 제공(7.5): 정보 등록 후 원래 승인대기 단계로 복귀한다.
  http.post("/api/workflows/:id/provide-info", async ({ params, request }) => {
    const id = params.id as string;
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as { actorId: string; note: string };
    const actor = employees.find((u) => u.id === body.actorId);
    if (
      !actor ||
      workflow.stage !== "information_required" ||
      workflow.pendingInfoTargetId !== actor.id ||
      !workflow.resumeStage ||
      !body.note?.trim()
    ) {
      return new HttpResponse(null, { status: 403 });
    }

    const now = new Date().toISOString();
    const entry: WorkflowActionEntry = {
      id: `wf-action-${Date.now()}`,
      action: "provide_info",
      actorId: actor.id,
      actorName: actor.name,
      actorPosition: actor.positions[0] ?? null,
      comment: body.note,
      createdAt: now,
    };
    const updated: ApprovalWorkflow = {
      ...workflow,
      stage: workflow.resumeStage,
      resumeStage: null,
      pendingInfoTargetId: null,
      history: [...workflow.history, entry],
    };
    workflows = workflows.map((w) => (w.id === id ? updated : w));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.get("/api/employees", () => {
    return HttpResponse.json(employees.map(toPublicEmployee));
  }),

  http.post("/api/employees", async ({ request }) => {
    const input = (await request.json()) as CreateEmployeeInput;
    const created: EmployeeRecord = {
      id: `emp-${Date.now()}`,
      name: input.name,
      team: input.team,
      role: input.role,
      positions: input.positions ?? [],
      active: input.active ?? true,
      username: input.username ?? "",
      password: input.password ?? "",
    };
    employees = [...employees, created];
    persistMockDb();
    return HttpResponse.json(toPublicEmployee(created), { status: 201 });
  }),

  http.patch("/api/employees/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = employees.find((e) => e.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateEmployeeInput;
    const updated: EmployeeRecord = {
      ...target,
      ...patch,
      password: patch.password || target.password,
    };
    employees = employees.map((e) => (e.id === id ? updated : e));
    persistMockDb();
    return HttpResponse.json(toPublicEmployee(updated));
  }),

  http.post("/api/auth/login", async ({ request }) => {
    const { username, password } = (await request.json()) as {
      username: string;
      password: string;
    };
    const matched = employees.find(
      (e) =>
        e.active &&
        e.username &&
        e.username === username &&
        e.password === password,
    );
    if (!matched) {
      return HttpResponse.json(
        { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
        { status: 401 },
      );
    }
    return HttpResponse.json(toPublicEmployee(matched));
  }),

  http.delete("/api/employees/:id", ({ params }) => {
    const id = params.id as string;
    const target = employees.find((e) => e.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    employees = employees.filter((e) => e.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/merchants", () => {
    return HttpResponse.json(merchants);
  }),

  http.post("/api/merchants", async ({ request }) => {
    const input = (await request.json()) as CreateMerchantInput;
    const created: MerchantRecord = {
      id: `merchant-${Date.now()}`,
      name: input.name,
      owner: input.owner,
      phone: input.phone,
      businessNo: input.businessNo ?? "",
      address: input.address ?? "",
      status: input.status ?? "consulting",
      manager: input.manager ?? "",
      contractDate: input.contractDate ?? null,
      memo: input.memo ?? "",
    };
    merchants = [created, ...merchants];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/merchants/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = merchants.find((m) => m.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateMerchantInput;
    const updated: MerchantRecord = { ...target, ...patch };
    merchants = merchants.map((m) => (m.id === id ? updated : m));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/merchants/:id", ({ params }) => {
    const id = params.id as string;
    const target = merchants.find((m) => m.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    merchants = merchants.filter((m) => m.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/calendar-events", () => {
    return HttpResponse.json(calendarEvents);
  }),

  http.post("/api/calendar-events", async ({ request }) => {
    const input = (await request.json()) as CreateCalendarEventInput;
    const created: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: input.title,
      date: input.date,
      type: input.type ?? "etc",
      memo: input.memo ?? "",
    };
    calendarEvents = [...calendarEvents, created];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/calendar-events/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = calendarEvents.find((e) => e.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateCalendarEventInput;
    const updated: CalendarEvent = { ...target, ...patch };
    calendarEvents = calendarEvents.map((e) => (e.id === id ? updated : e));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/calendar-events/:id", ({ params }) => {
    const id = params.id as string;
    const target = calendarEvents.find((e) => e.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    calendarEvents = calendarEvents.filter((e) => e.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/external-techs", () => {
    return HttpResponse.json(externalTechs);
  }),

  http.post("/api/external-techs", async ({ request }) => {
    const input = (await request.json()) as CreateExternalTechInput;
    const created: ExternalTechRecord = {
      id: `ext-tech-${Date.now()}`,
      name: input.name,
      phone: input.phone,
      company: input.company ?? "",
      region: input.region ?? "",
      specialty: input.specialty ?? "",
      status: input.status ?? "active",
      contractedAt: input.contractedAt ?? null,
      memo: input.memo ?? "",
    };
    externalTechs = [created, ...externalTechs];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/external-techs/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = externalTechs.find((t) => t.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateExternalTechInput;
    const updated: ExternalTechRecord = { ...target, ...patch };
    externalTechs = externalTechs.map((t) => (t.id === id ? updated : t));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/external-techs/:id", ({ params }) => {
    const id = params.id as string;
    const target = externalTechs.find((t) => t.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    externalTechs = externalTechs.filter((t) => t.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/inventory", () => {
    return HttpResponse.json(inventoryItems);
  }),

  http.post("/api/inventory", async ({ request }) => {
    const input = (await request.json()) as CreateInventoryItemInput;
    const created: InventoryItemRecord = {
      id: `inv-${Date.now()}`,
      modelName: input.modelName,
      location: input.location,
      expectedQty: input.expectedQty,
      countedQty: null,
      status: "pending",
      countedBy: null,
      countedAt: null,
      memo: input.memo ?? "",
    };
    inventoryItems = [created, ...inventoryItems];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.post("/api/inventory/:id/count", async ({ params, request }) => {
    const id = params.id as string;
    const target = inventoryItems.find((item) => item.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const body = (await request.json()) as RecordInventoryCountInput;
    const updated: InventoryItemRecord = {
      ...target,
      countedQty: body.countedQty,
      countedBy: body.countedBy,
      countedAt: new Date().toISOString(),
      status: body.countedQty === target.expectedQty ? "matched" : "mismatched",
    };
    inventoryItems = inventoryItems.map((item) =>
      item.id === id ? updated : item,
    );
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/inventory/:id", ({ params }) => {
    const id = params.id as string;
    const target = inventoryItems.find((item) => item.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    inventoryItems = inventoryItems.filter((item) => item.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/transfers", () => {
    return HttpResponse.json(transfers);
  }),

  http.post("/api/transfers", async ({ request }) => {
    const input = (await request.json()) as CreateTransferInput;
    const created: TransferRecord = {
      id: `transfer-${Date.now()}`,
      name: input.name,
      owner: input.owner,
      phone: input.phone,
      transferType: input.transferType,
      status: input.status ?? "receipt",
      scheduledDate: input.scheduledDate ?? null,
      assignedTech: input.assignedTech ?? null,
      address: input.address ?? "",
      memo: input.memo ?? "",
    };
    transfers = [created, ...transfers];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/transfers/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = transfers.find((t) => t.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateTransferInput;
    const updated: TransferRecord = { ...target, ...patch };
    transfers = transfers.map((t) => (t.id === id ? updated : t));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/transfers/:id", ({ params }) => {
    const id = params.id as string;
    const target = transfers.find((t) => t.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    transfers = transfers.filter((t) => t.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/chat-messages", () => {
    return HttpResponse.json(chatMessages);
  }),

  http.post("/api/chat-messages", async ({ request }) => {
    const body = (await request.json()) as CreateChatMessageInput & {
      actorId: string;
    };
    const actor = employees.find((u) => u.id === body.actorId);
    if (!actor) {
      return new HttpResponse(null, { status: 403 });
    }
    const created: ChatMessage = {
      id: `chat-${Date.now()}`,
      channelId: body.channelId,
      authorId: actor.id,
      authorName: actor.name,
      content: body.content,
      createdAt: new Date().toISOString(),
    };
    chatMessages = [...chatMessages, created];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.get("/api/contracts", () => {
    return HttpResponse.json(contracts);
  }),

  http.post("/api/contracts", async ({ request }) => {
    const input = (await request.json()) as CreateContractInput;
    const created: ContractRecord = {
      id: `contract-${Date.now()}`,
      merchantName: input.merchantName,
      ownerName: input.ownerName,
      phone: input.phone,
      fileName: input.fileName ?? `${input.merchantName}_가맹계약서.pdf`,
      status: input.status ?? "draft",
      sentAt: input.sentAt ?? null,
      signedAt: input.signedAt ?? null,
      memo: input.memo ?? "",
    };
    contracts = [created, ...contracts];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/contracts/:id", async ({ params, request }) => {
    const id = params.id as string;
    const target = contracts.find((c) => c.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    const patch = (await request.json()) as UpdateContractInput;
    const updated: ContractRecord = { ...target, ...patch };
    contracts = contracts.map((c) => (c.id === id ? updated : c));
    persistMockDb();
    return HttpResponse.json(updated);
  }),

  http.delete("/api/contracts/:id", ({ params }) => {
    const id = params.id as string;
    const target = contracts.find((c) => c.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }
    contracts = contracts.filter((c) => c.id !== id);
    persistMockDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/slack-messages", () => {
    return HttpResponse.json(slackMessages);
  }),

  http.post("/api/slack-messages", async ({ request }) => {
    const body = (await request.json()) as CreateSlackMessageInput & {
      actorId: string;
    };
    const actor = employees.find((u) => u.id === body.actorId);
    if (!actor) {
      return new HttpResponse(null, { status: 403 });
    }
    const created: SlackMessageRecord = {
      id: `slack-${Date.now()}`,
      channel: body.channel,
      senderId: actor.id,
      senderName: actor.name,
      content: body.content,
      sentAt: new Date().toISOString(),
    };
    slackMessages = [...slackMessages, created];
    persistMockDb();
    return HttpResponse.json(created, { status: 201 });
  }),
];
