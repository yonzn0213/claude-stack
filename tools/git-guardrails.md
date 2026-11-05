# git-guardrails (개작판)

| 항목 | 내용 |
|---|---|
| 유형 | Hook (PreToolUse) |
| 상태 | Assess — 작성 · 테스트 완료, 등록 전 |
| 원본 | [mattpocock/skills `skills/misc/git-guardrails-claude-code`](https://github.com/mattpocock/skills/tree/main/skills/misc/git-guardrails-claude-code) (MIT) |
| 사용 버전 | 개작판 [`hooks/git-guardrails.js`](../hooks/git-guardrails.js) |
| 원본 상태 | 유지보수 중단(frozen) — 결함 보고 시 NOT_PLANNED 종료 |
| 최종 확인 | 2026-11-05 |

## 개요

Claude Code가 셸 명령을 실행하기 전에 위험 git 명령을 가로채는 hook. 개인 규칙(CLAUDE.md)의 구분을 그대로 따름.

| 판정 | 대상 |
|---|---|
| deny (차단) | force push — `--force`, `-f`, `--force-with-lease`, `--force-if-includes`, `+refspec`, `--mirror` |
| ask (확인 요청) | `push`, `rebase`, `reset --hard`, `clean -f`, `branch -D`, `checkout .` · `restore .` |
| 통과 | 그 외 |

## 원본 결함과 대응

| # | 원본 결함 | 업스트림 | 개작판 대응 |
|---|---|---|---|
| 1 | `matcher: "Bash"`만 검사 — PowerShell 도구 경유 시 우회 | 미보고 | `Bash`, `PowerShell` 모두 검사 |
| 2 | 명령 전체 문자열 grep — 커밋 메시지 내 "git push" 문구도 차단 | 미보고 | ask 판정 시 따옴표 내부 제외 (deny는 원문 기준 유지) |
| 3 | `git -C <dir> push` 등 전역 옵션 사이 우회 | [#301](https://github.com/mattpocock/skills/issues/301) NOT_PLANNED | 전역 옵션 허용 패턴 |
| 4 | `jq` 미설치 시 검사 없이 통과(fail-open) | [#898](https://github.com/mattpocock/skills/issues/898), [#1293](https://github.com/mattpocock/skills/issues/1293) NOT_PLANNED | Node 단독 실행, `jq` 의존 제거 |
| 5 | 일반 `git push`까지 전면 차단 | 설계 차이 (결함 아님) | force push만 deny, 나머지는 ask |

1 · 2번은 업스트림에 미보고 상태. 원본이 frozen이라 보고하지 않음.

## 알려진 한계

| 한계 | 영향 | 비고 |
|---|---|---|
| hook 실행 실패(Node 미설치 등) 시 통과 | Claude Code는 hook 오류를 비차단으로 처리 | Node는 다른 hook(brain)에도 필수라 동일 조건 |
| 입력 JSON 파싱 실패 시 통과 | 정상 환경에서는 발생하지 않음 | 모든 셸 명령이 막히는 것보다 기존 권한 체계에 맡기는 쪽 선택 |
| 문자열 패턴 기반 | 별칭(`git config alias`), 스크립트 파일 내부 명령은 탐지 불가 | 의도적 우회를 막는 장치가 아니라 실수 방지용 |

## 평가 기준

| 항목 | 통과 조건 |
|---|---|
| 판정 정확도 | 판정 테스트 전건 통과 (현재 26/26) |
| 실환경 동작 | 등록 후 `git push` 시 확인 요청, force push 시 차단 메시지 확인 |
| 오탐 | 1주 운용 중 정상 명령 오차단 0건 |

## 설치 · 제거

`~/.claude/settings.json`의 `hooks`에 추가:

```json
"PreToolUse": [{ "matcher": "Bash|PowerShell",
  "hooks": [{ "type": "command", "command": "node \"C:/Users/pc/.claude/hooks/git-guardrails.js\"", "timeout": 5 }] }]
```

제거: 위 항목 삭제 후 `~/.claude/hooks/git-guardrails.js` 삭제.

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-11-05 | Assess | 원본 결함 확인 후 개작판 작성, 판정 테스트 26건 통과 |
