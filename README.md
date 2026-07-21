<div align="center">

# POSMOS 전산 시스템

**포스 설치 및 가입 대행 전산 시스템**

[![CI](https://github.com/postmos-labs/posmos-system/actions/workflows/ci.yml/badge.svg)](https://github.com/postmos-labs/posmos-system/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-package_manager-f69220?logo=pnpm&logoColor=white)

</div>

---

## 개요

POSMOS는 가맹점의 포스(POS) 설치 신청부터 가입 대행, 설치 일정 관리까지 처리하는 내부 전산 시스템입니다.

## Tech Stack

| 영역                    | 사용 기술                                     |
| ----------------------- | --------------------------------------------- |
| 프레임워크              | Next.js 16 (App Router), React 19, TypeScript |
| 스타일                  | Tailwind CSS v4                               |
| Lint / Format           | ESLint 9, Prettier                            |
| Unit / Component 테스트 | Vitest, React Testing Library                 |
| E2E 테스트              | Playwright                                    |
| Mock 데이터             | MSW (Mock Service Worker)                     |
| 패키지 매니저           | pnpm                                          |
| 커밋 훅                 | Husky, lint-staged, commitlint                |
| CI                      | GitHub Actions                                |

## 시작하기

### 사전 요구사항

- Node.js 22 이상
- pnpm

### 설치 및 실행

```bash
pnpm install
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 프로젝트 구조

```
src/
  app/            # App Router 라우트 (route는 얇게 유지)
  components/     # 공통(shared) UI 컴포넌트
  lib/             # 공통 유틸/헬퍼 (lib/supabase는 추후 연동 시 사용)
  hooks/          # 공통 커스텀 훅
  types/          # 공통 공유 타입
  mocks/          # MSW handlers, browser/server 워커
```

기능이 커지면 `src/features/<feature>/{components,hooks,api,types.ts}` 형태로 점진적으로 분리합니다. 각 feature의 `api/`가 데이터 접근 계층(seam) 역할을 하며, 지금은 MSW mock을 호출하고 추후 실제 백엔드로 교체됩니다. 자세한 컨벤션은 [CLAUDE.md](./CLAUDE.md)를 참고하세요.

## 스크립트

| 명령                                | 설명                        |
| ----------------------------------- | --------------------------- |
| `pnpm dev`                          | 개발 서버 실행              |
| `pnpm build`                        | 프로덕션 빌드               |
| `pnpm start`                        | 프로덕션 서버 실행          |
| `pnpm lint`                         | ESLint 검사                 |
| `pnpm format` / `pnpm format:check` | Prettier 포맷 적용 / 검사   |
| `pnpm typecheck`                    | TypeScript 타입 검사        |
| `pnpm test` / `pnpm test:watch`     | Vitest 단위/컴포넌트 테스트 |
| `pnpm test:e2e`                     | Playwright e2e 테스트       |

## 테스트 전략

- **Unit / Component**: Vitest + React Testing Library, 소스 파일 옆에 colocate (`*.test.tsx`)
- **E2E**: Playwright, 최상위 `e2e/` 폴더
- **Mock**: MSW — 개발 서버는 브라우저 워커로, 테스트는 Node 서버(`vitest.setup.ts`)로 동일한 handler(`src/mocks/handlers.ts`)를 공유

## 커밋 컨벤션

`prefix: 명사형 요약` + `* 명사형 항목` 형식을 사용합니다 (commitlint로 자동 검증).

```
feat: 계약서 서명 페이지 추가

* 전자서명 캔버스 컴포넌트 추가
* 서명 완료 후 알림 발송 연동
```

- prefix: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `revert`
- 요약/항목 모두 "~습니다/~했다/~함" 같은 문장형이 아닌 명사형으로 종결

## 배포

Vercel을 통해 배포합니다. (배포 설정은 추후 추가 예정)
