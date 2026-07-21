import type { InventoryItemRecord } from "@/features/inventory/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialInventoryItems(): InventoryItemRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureInventoryItems(): InventoryItemRecord[] {
  return [
    {
      id: "inv-a100-hq",
      modelName: "카드단말기 A100",
      location: "본사 재고",
      expectedQty: 20,
      countedQty: null,
      status: "pending",
      countedBy: null,
      countedAt: null,
      memo: "",
    },
    {
      id: "inv-a100-park",
      modelName: "카드단말기 A100",
      location: "박기사 보유",
      expectedQty: 5,
      countedQty: 5,
      status: "matched",
      countedBy: "박기사 매니저",
      countedAt: "2026-07-15T09:00:00+09:00",
      memo: "",
    },
    {
      id: "inv-printer-hq",
      modelName: "영수증 프린터 P20",
      location: "본사 재고",
      expectedQty: 12,
      countedQty: 10,
      status: "mismatched",
      countedBy: "이기사 책임매니저",
      countedAt: "2026-07-14T14:30:00+09:00",
      memo: "2대 누락, 확인 필요",
    },
  ];
}
