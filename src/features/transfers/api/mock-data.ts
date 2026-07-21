import type { TransferRecord } from "@/features/transfers/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialTransfers(): TransferRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureTransfers(): TransferRecord[] {
  return [
    {
      id: "transfer-1",
      name: "소담족발 마포점",
      owner: "조성훈",
      phone: "010-4418-7300",
      transferType: "명의변경",
      status: "receipt",
      scheduledDate: "2026-07-25",
      assignedTech: null,
      address: "서울 마포구 공덕동",
      memo: "기존 단말기 명의만 변경",
    },
    {
      id: "transfer-2",
      name: "카페 무이",
      owner: "강민지",
      phone: "010-6634-2108",
      transferType: "이전설치",
      status: "processing",
      scheduledDate: "2026-07-22",
      assignedTech: "박기사",
      address: "경기 성남시 분당구",
      memo: "매장 이전에 따른 재설치",
    },
    {
      id: "transfer-3",
      name: "제일곱창 본점",
      owner: "백승호",
      phone: "010-4432-8871",
      transferType: "폐업철거",
      status: "done",
      scheduledDate: "2026-07-10",
      assignedTech: "최기사",
      address: "서울 마포구 서교동",
      memo: "장비 회수 완료",
    },
  ];
}
