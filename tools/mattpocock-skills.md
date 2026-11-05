# mattpocock/skills

| 항목 | 내용 |
|---|---|
| 유형 | Skill set |
| 상태 | Trial — 개별 스킬 상태는 「스킬별 기록」 참고 |
| 원본 | https://github.com/mattpocock/skills |
| 라이선스 | MIT |
| 도입일 | 2026-11-05 (git-guardrails 개작판) |
| 최종 확인 | 2026-11-05 |

## 개요

Matt Pocock(Total TypeScript)이 개인 작업 환경에서 사용하는 에이전트 스킬 공개본. 절차를 강제하는 superpowers와 달리 필요한 스킬만 선택 설치 · 호출하는 구조.

| 분류 | 스킬 |
|---|---|
| 계획 · 설계 | `grill-me`, `to-prd`, `to-issues` |
| 개발 | `tdd`, `diagnose`, `triage-issue`, `improve-codebase-architecture`, `zoom-out` |
| 도구 | `git-guardrails-claude-code`, `setup-pre-commit` |

## 도입 배경

superpowers가 다루지 않는 영역 보완.
- 위험 git 명령 차단을 규칙(CLAUDE.md)이 아닌 hook으로 강제
- 설계 착수 전 계획의 결함 검증

## 중복 관계

- `tdd` ↔ superpowers `test-driven-development`, `diagnose` ↔ superpowers `systematic-debugging` → 설치 제외

## 공통 운영 리스크

| 리스크 | 점검 신호 | 대응 |
|---|---|---|
| `misc/` 스킬의 유지보수 중단(frozen) — 결함이 보고되어도 수정되지 않음 | 이슈가 NOT_PLANNED로 종료 | 사용 스킬은 개작판으로 자체 유지 |
| 개인 저장소 특성상 스킬명 · 구성의 예고 없는 변경 | 저장소 내 deprecated 폴더 이동, 스킬 수 변동 | 사용 스킬만 고정 버전으로 사본 관리 |
| 저장소별 초기 설정(`setup-matt-pocock-skills`) 필요 | 레포 증가 시 설정 누락 | 필요 레포에만 한정 적용 |
| `to-issues`, `triage` 계열의 GitHub Issues 전제 | 사내 이슈 시스템 사용 레포에서 미동작 | 개인 프로젝트에 한정 |

## 스킬별 기록

| 스킬 | 상태 | 사용 형태 |
|---|---|---|
| `git-guardrails-claude-code` | Trial | 개작판 [`hooks/git-guardrails.js`](../hooks/git-guardrails.js) |
| `grill-me` | Assess | 미설치 |
| `to-issues` | Assess | 미설치 |

### git-guardrails-claude-code — Trial (개작판)

원본은 `skills/misc/` 소속 Bash 스크립트 1개(`block-dangerous-git.sh`)와 hook 설치 절차서. 유지보수 중단(frozen) 상태라 원본 대신 개작판 사용.

판정 기준 (CLAUDE.md 「도구 실행 권한」 구분 반영)

| 판정 | 대상 |
|---|---|
| deny (차단) | force push — `--force`, `-f`, `--force-with-lease`, `--force-if-includes`, `+refspec`, `--mirror` |
| ask (확인 요청) | `push`, `rebase`, `reset --hard`, `clean -f`, `branch -D`, `checkout .` · `restore .` |
| 통과 | 그 외, 신뢰 목록 레포의 일반 `push` |

레포별 push 확인 생략 (2026-11-05 추가)

- 배경: SaaS 메타데이터 이력 관리 등 단독 관리 레포에서 push 확인이 실익 없이 작업 흐름만 중단
- 방식: 레포별 첫 push에서 확인 요청 → 사용자 요청 시 해당 레포를 신뢰 목록(`hooks/git-guardrails.trusted.json`, 비공개)에 등록 → 이후 일반 push만 확인 생략
- 판정 대상 레포: `git -C <경로>` 지정 시 해당 경로, 미지정 시 hook 입력의 `cwd`. worktree는 메인 레포로 환원
- 유지: force push 차단, rebase · reset --hard 등 나머지 확인 요청
- 관리: `node git-guardrails.js trust <경로>` / `untrust <경로>` / `list`

원본 결함과 대응

| # | 원본 결함 | 업스트림 | 개작판 대응 |
|---|---|---|---|
| 1 | `matcher: "Bash"`만 검사 — PowerShell 도구 경유 시 우회 | 미보고 | `Bash`, `PowerShell` 모두 검사 |
| 2 | 명령 전체 문자열 grep — 커밋 메시지 내 "git push" 문구도 차단 | 미보고 | ask 판정 시 따옴표 내부 제외 (deny는 원문 기준 유지) |
| 3 | `git -C <dir> push` 등 전역 옵션 사이 우회 | [#301](https://github.com/mattpocock/skills/issues/301) NOT_PLANNED | 전역 옵션 허용 패턴 |
| 4 | `jq` 미설치 시 검사 없이 통과(fail-open) | [#898](https://github.com/mattpocock/skills/issues/898), [#1293](https://github.com/mattpocock/skills/issues/1293) NOT_PLANNED | Node 단독 실행, `jq` 의존 제거 |
| 5 | 일반 `git push`까지 전면 차단 | 설계 차이 (결함 아님) | force push만 deny, 나머지는 ask |

- 1 · 2번은 원본 frozen 상태로 업스트림 미보고

알려진 한계

| 한계 | 영향 | 비고 |
|---|---|---|
| hook 실행 실패(Node 미설치 등) 시 통과 | Claude Code는 hook 오류를 비차단으로 처리 | Node는 다른 hook(brain)에도 필수라 동일 조건 |
| 입력 JSON 파싱 실패 시 통과 | 정상 환경에서는 발생하지 않음 | 모든 셸 명령 차단보다 기존 권한 체계에 위임 |
| 문자열 패턴 기반 | 별칭(`git config alias`), 스크립트 파일 내부 명령 탐지 불가 | 의도적 우회 방지가 아닌 실수 방지용 |

평가 기준

| 항목 | 통과 조건 |
|---|---|
| 판정 정확도 | 판정 테스트 전건 통과 (기존 26건 + 신뢰 목록 15건) |
| 실환경 동작 | `git push` 시 확인 요청, force push 시 차단 메시지 |
| 오탐 | 1주 운용 중 정상 명령 오차단 0건 |

설치 · 제거

```json
// ~/.claude/settings.json → hooks
"PreToolUse": [{ "matcher": "Bash|PowerShell",
  "hooks": [{ "type": "command", "command": "node \"C:/Users/pc/.claude/hooks/git-guardrails.js\"", "timeout": 5 }] }]
```

제거: 위 항목 삭제 후 `~/.claude/hooks/git-guardrails.js` 삭제.

### grill-me — Assess

| 항목 | 내용 |
|---|---|
| 목적 | 계획에 대한 질의 기반 검증 |
| 선정 사유 | superpowers brainstorming 이전 단계 보강 |
| 평가 기준 | 계획 단계 질문이 이후 설계 변경을 1건 이상 사전에 발견, superpowers 스킬과 오발동 없음 |

### to-issues — Assess

| 항목 | 내용 |
|---|---|
| 목적 | 계획 → GitHub 이슈 분해 |
| 선정 사유 | 개인 프로젝트 작업 단위 관리 |
| 제약 | GitHub Issues 사용 레포에 한정 |

## 결정 이력

| 날짜 | 대상 | 상태 | 사유 |
|---|---|---|---|
| 2026-11-05 | 전체 | Assess | superpowers 미보유 영역 보완 후보 |
| 2026-11-05 | git-guardrails | Trial | 원본 결함 확인, 개작판 작성 · 판정 테스트 26건 통과 · hook 등록 |
| 2026-11-05 | git-guardrails | Trial (유지) | 단독 관리 레포의 push 확인 부담 → 레포별 신뢰 목록 도입 |
