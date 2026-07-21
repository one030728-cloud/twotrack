import type { ExternalTechRecord } from "@/features/external-techs/types";

/** 실제 서비스 초기 상태. 데모용 목데이터 없이 빈 목록에서 시작한다. */
export function createInitialExternalTechs(): ExternalTechRecord[] {
  return [];
}

/** 테스트 전용 목업 픽스처. 실제 앱 초기 데이터로는 사용하지 않는다. */
export function createFixtureExternalTechs(): ExternalTechRecord[] {
  return [
    {
      id: "ext-tech-kim",
      name: "김승우",
      phone: "010-5522-3391",
      company: "우리설비",
      region: "서울/경기",
      specialty: "설치",
      status: "active",
      contractedAt: "2026-03-02",
      memo: "주말 작업 가능",
    },
    {
      id: "ext-tech-lee",
      name: "이도훈",
      phone: "010-6631-4420",
      company: "한빛테크",
      region: "인천",
      specialty: "AS",
      status: "active",
      contractedAt: "2026-05-14",
      memo: "",
    },
    {
      id: "ext-tech-park",
      name: "박세진",
      phone: "010-7743-1298",
      company: "대한통신",
      region: "부산/경남",
      specialty: "인터넷",
      status: "inactive",
      contractedAt: "2025-11-20",
      memo: "계약 만료, 재계약 협의 중",
    },
  ];
}
