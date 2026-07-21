# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@PERFORMANCE.md

## Project Overview

가맹점의 포스 설치 신청, 가입 대행, 설치 일정 관리를 처리하는 내부 전산 시스템의 프론트엔드.

## Commands

```bash
pnpm dev              # 개발 서버 실행
pnpm build            # 프로덕션 빌드
pnpm lint             # ESLint
pnpm format           # Prettier 적용
pnpm format:check     # Prettier 검사만
pnpm typecheck        # tsc --noEmit
pnpm test             # Vitest 단위/컴포넌트 테스트 (1회 실행)
pnpm test:watch       # Vitest watch 모드
pnpm test:e2e         # Playwright e2e 테스트
```

단일 테스트 파일만 실행: `pnpm test src/app/page.test.tsx` / `pnpm exec playwright test e2e/home.spec.ts`

## Architecture

- **App Router** (`src/app`) — route는 얇게 유지하고 실제 로직/마크업은 아래 계층에 위임한다.
- **공통 계층**: `src/components`(공유 UI), `src/lib`(유틸/헬퍼, `src/lib/supabase`는 실제 백엔드 연동 시점에 채울 자리), `src/hooks`, `src/types`.
- **기능별 계층 (점진적으로 도입)**: 화면/기능이 커지면 그때 `src/features/<feature>/{components,hooks,api,types.ts}`로 분리한다. 처음부터 빈 도메인 폴더를 만들지 않는다. 2개 이상 feature에서 재사용되면 공통 계층으로 승격.
- **데이터 접근 계층(seam)**: 각 feature의 `api/`가 UI와 데이터 소스 사이의 경계 역할을 한다. 지금은 MSW mock을 호출하고, 추후 실제 백엔드(Supabase 등)로 교체될 때 이 파일들만 바뀌는 것이 목표.
- **Mock (`src/mocks`)**: `handlers.ts`가 단일 소스, `browser.ts`(브라우저 워커)와 `server.ts`(Vitest용 Node 서버)가 이를 공유한다. 개발 모드에서는 `src/mocks/MswProvider.tsx`가 `src/app/layout.tsx`에서 워커를 기동한다.

## Conventions

- **커밋 메시지**: `prefix: 명사형 요약` + `* 명사형 항목` 목록. prefix는 `feat/fix/chore/docs/style/refactor/perf/test/build/ci/revert`. 요약/항목 모두 "~습니다/~했다/~함" 같은 문장형이 아닌 명사형으로 종결한다 (commitlint로 자동 검증, `.husky/commit-msg`).
- **테스트**: unit/component는 소스 옆에 colocate(`*.test.tsx`), e2e는 최상위 `e2e/`에 둔다. 새 컴포넌트/훅/유틸 파일을 생성할 때는 대응하는 테스트 파일을 반드시 같이 작성한다(같은 커밋에 포함).
- **줄바꿈**: `.gitattributes`로 LF 고정. Windows에서 `core.autocrlf=true`인 경우 rebase 등으로 CRLF가 섞일 수 있으니 `pnpm format`으로 정규화 후 커밋할 것.
- **가벼운 검증 위임**: lint/format/typecheck/build 같은 기계적 확인은 `quick-check` 서브에이전트(Haiku)에 위임해 메인 세션 비용을 아낀다.
