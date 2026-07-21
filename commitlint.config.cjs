// 커밋 메시지 규칙: `prefix: 한 줄 요약(명사형 종결)` + 본문은 `* 항목(명사형 종결)` 목록
// 예)
// chore: ESLint 및 Prettier 연동
//
// * eslint-config-prettier 추가
// * .prettierrc.json 설정 추가
const sentenceEndingPattern =
  /(습니다|했습니다|합니다|했다|한다|됐다|됨\.?|했음|임\.?)\s*$/u;

/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  plugins: [
    {
      rules: {
        "header-noun-ending": (parsed) => {
          const { subject } = parsed;
          if (!subject) return [true];
          return [
            !sentenceEndingPattern.test(subject),
            '커밋 요약은 "~습니다/~했다/~함" 같은 문장형이 아닌 명사형으로 끝나야 합니다. 예: "버그 수정"',
          ];
        },
        "body-noun-ending": (parsed) => {
          const { body } = parsed;
          if (!body) return [true];
          const violations = body
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.startsWith("*"))
            .filter((line) => sentenceEndingPattern.test(line));
          return [
            violations.length === 0,
            `커밋 본문의 각 항목은 명사형으로 끝나야 합니다. 위반 항목: ${violations.join(", ")}`,
          ];
        },
      },
    },
  ],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "chore",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "revert",
      ],
    ],
    "subject-case": [0],
    "header-noun-ending": [2, "always"],
    "body-noun-ending": [2, "always"],
  },
};
