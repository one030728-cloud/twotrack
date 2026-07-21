/**
 * MSW mock 핸들러의 상태는 모듈 top-level 변수에 있어 브라우저 새로고침(JS 재실행)마다
 * 초기화된다. 실제 백엔드가 준비되기 전까지는 localStorage에 스냅샷을 저장해
 * 새로고침 후에도 등록/변경한 데이터가 유지되도록 한다.
 */

const STORAGE_KEY = "posmos-mock-db:v1";

export interface PersistedMockDb {
  notifications?: unknown;
  receipts?: unknown;
  installs?: unknown;
  workflows?: unknown;
  employees?: unknown;
  merchants?: unknown;
  calendarEvents?: unknown;
  externalTechs?: unknown;
  inventoryItems?: unknown;
  transfers?: unknown;
}

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadPersistedDb(): PersistedMockDb {
  const storage = getStorage();
  const raw = storage?.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PersistedMockDb;
  } catch {
    return {};
  }
}

export function savePersistedDb(db: PersistedMockDb): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/** 저장된 값이 배열이 아니면(스키마 변경, 손상된 데이터 등) 초기값으로 대체한다. */
export function asArray<T>(value: unknown, fallback: () => T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : fallback();
}
