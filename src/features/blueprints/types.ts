export type BlueprintSource = "install" | "store";

export interface BlueprintEntry {
  id: string;
  source: BlueprintSource;
  /** 설치건 id 또는 매장 id. 설치 출처만 상세 화면으로 이동할 수 있다. */
  refId: string | number;
  title: string;
  fileName: string;
  uploadedAt: string;
}
