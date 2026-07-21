import type { ContractRecord } from "@/features/contracts/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialContracts(): ContractRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureContracts(): ContractRecord[] {
  return [
    {
      id: "contract-1",
      merchantName: "카페 아모르",
      ownerName: "김아름",
      phone: "010-2231-8842",
      fileName: "카페아모르_가맹계약서.pdf",
      status: "signed",
      sentAt: "2026-07-14T09:00:00+09:00",
      signedAt: "2026-07-15T11:20:00+09:00",
      memo: "",
    },
    {
      id: "contract-2",
      merchantName: "포레스트 키친",
      ownerName: "이서연",
      phone: "010-6940-1185",
      fileName: "포레스트키친_가맹계약서.pdf",
      status: "pending",
      sentAt: "2026-07-19T10:00:00+09:00",
      signedAt: null,
      memo: "서명 리마인드 필요",
    },
    {
      id: "contract-3",
      merchantName: "명동떡볶이 본점",
      ownerName: "오민석",
      phone: "010-4471-2093",
      fileName: "명동떡볶이_가맹계약서.pdf",
      status: "draft",
      sentAt: null,
      signedAt: null,
      memo: "",
    },
  ];
}
