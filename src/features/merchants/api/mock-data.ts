import type { MerchantRecord } from "@/features/merchants/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialMerchants(): MerchantRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureMerchants(): MerchantRecord[] {
  return [
    {
      id: "merchant-cafe-amor",
      name: "카페 아모르",
      owner: "김아름",
      phone: "010-2231-8842",
      businessNo: "212-45-78190",
      address: "서울 성동구 성수동2가 12-3 1층",
      status: "contracted",
      manager: "서지은",
      contractDate: "2026-07-16",
      memo: "오픈 전 설치 예정",
    },
    {
      id: "merchant-myeongdong",
      name: "명동떡볶이 본점",
      owner: "오민석",
      phone: "010-4471-2093",
      businessNo: "104-88-44210",
      address: "서울 중구 명동2가 33-1 지하 1층",
      status: "contracted",
      manager: "최혜민",
      contractDate: "2026-07-10",
      memo: "",
    },
    {
      id: "merchant-forest-kitchen",
      name: "포레스트 키친",
      owner: "이서연",
      phone: "010-6940-1185",
      businessNo: "107-21-33456",
      address: "경기 성남시 분당구 정자동 45-2",
      status: "consulting",
      manager: "서지은",
      contractDate: null,
      memo: "계약 조건 조율 중",
    },
    {
      id: "merchant-jeilgopchang",
      name: "제일곱창 본점",
      owner: "백승호",
      phone: "010-4432-8871",
      businessNo: "312-09-11223",
      address: "서울 마포구 서교동 12-9",
      status: "terminated",
      manager: "서지은",
      contractDate: "2026-05-02",
      memo: "가맹 취소",
    },
  ];
}
