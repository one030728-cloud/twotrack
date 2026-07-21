import type { StoreRecord } from "@/features/stores/types";

export const STORE_MOCKS: StoreRecord[] = [
  {
    id: "store-cafe-amor",
    name: "카페 아모르",
    owner: "김하린",
    phone: "010-2231-8842",
    businessNo: "212-45-78190",
    address: "서울 성동구 성수동2가 12-3 1층",
    status: "opening",
    memo: "오픈 전 설치 예정. 카운터 우측 전원 위치 확인 필요",
    devices: [],
    workHistory: [
      {
        id: "wo-1",
        workedAt: "2026-07-16",
        typeLabel: "설치",
        statusLabel: "제품준비",
        assignedTech: "박기사",
        resultMemo: "오픈 전날 오전 방문 우선",
        devices: [
          {
            serialNo: "A100-2407-001",
            modelName: "카드단말기 A100",
            action: "installed",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-1-blueprint",
        type: "blueprint",
        fileName: "카페아모르_카운터도면.pdf",
        uploadedAt: "2026-07-16T10:25:00+09:00",
      },
    ],
  },
  {
    id: "store-myeongdong",
    name: "명동떡볶이 본점",
    owner: "오민석",
    phone: "010-4471-2093",
    businessNo: "104-88-44210",
    address: "서울 중구 명동2가 33-1 지하 1층",
    status: "active",
    memo: "설치 완료 후 정상 운영",
    devices: [
      {
        id: "sd-4-a100",
        modelName: "카드단말기 A100",
        serialNo: "A100-2407-009",
        status: "installed",
        installedAt: "2026-07-14",
        installedWorkOrderId: "wo-4",
      },
    ],
    workHistory: [
      {
        id: "wo-4",
        workedAt: "2026-07-14",
        typeLabel: "설치",
        statusLabel: "설치완료",
        assignedTech: "최기사",
        resultMemo: "설치 완료. 서명 확인 후 사진 등록",
        devices: [
          {
            serialNo: "A100-2407-009",
            modelName: "카드단말기 A100",
            action: "installed",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-4-photo",
        type: "completionPhoto",
        fileName: "명동떡볶이_완료사진.jpg",
        uploadedAt: "2026-07-14T15:18:00+09:00",
      },
    ],
  },
  {
    id: "store-brick-house",
    name: "브릭 하우스 강남점",
    owner: "정유나",
    phone: "010-7788-2231",
    businessNo: "220-90-18372",
    address: "서울 강남구 논현동 55-2 3층",
    status: "opening",
    memo: "가맹 접수에서 설치관리로 넘어온 신규 매장",
    devices: [],
    workHistory: [
      {
        id: "wo-5",
        workedAt: "2026-07-16",
        typeLabel: "설치",
        statusLabel: "접수",
        assignedTech: null,
        resultMemo: "기사 배정 전",
        devices: [],
      },
    ],
    attachments: [],
  },
  {
    id: "store-haru",
    name: "하루분식",
    owner: "박서준",
    phone: "010-7103-5529",
    businessNo: "117-30-90244",
    address: "서울 은평구 응암동 12-9",
    status: "active",
    memo: "프린터 전원 불량 AS 처리 완료",
    devices: [
      {
        id: "sd-11-printer",
        modelName: "프린터 단품",
        serialNo: "P20-2406-011",
        status: "installed",
        installedAt: "2026-06-02",
        installedWorkOrderId: "wo-old-11",
      },
    ],
    workHistory: [
      {
        id: "wo-11",
        workedAt: "2026-07-14",
        typeLabel: "AS",
        statusLabel: "처리완료",
        assignedTech: "이기사",
        resultMemo: "전원 어댑터 교체 후 정상 출력 확인",
        devices: [
          {
            serialNo: "P20-2406-011",
            modelName: "프린터 단품",
            action: "installed",
          },
        ],
      },
    ],
    attachments: [
      {
        id: "att-11-site",
        type: "sitePhoto",
        fileName: "하루분식_AS현장사진.jpg",
        uploadedAt: "2026-07-14T16:35:00+09:00",
      },
    ],
  },
];
