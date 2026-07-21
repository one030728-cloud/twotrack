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
} from "@/features/installations/types";
import { createInitialInstalls } from "@/features/installations/api/mock-data";

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
    const target = receipts.find((r) => r.id === id);
    if (!target) {
      return new HttpResponse(null, { status: 404 });
    }

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
      return HttpResponse.json({
        receipt: transferredReceipt,
        install: existing,
      });
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
    };
    installs = [created, ...installs];

    return HttpResponse.json(
      { receipt: transferredReceipt, install: created },
      { status: 201 },
    );
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
];
