# mattpocock/skills

| 항목 | 내용 |
|---|---|
| 유형 | Skill set |
| 상태 | Assess |
| 원본 | https://github.com/mattpocock/skills |
| 라이선스 | MIT |
| 버전 | 미설치 |
| 도입일 | — |
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

## 검토 대상

| 스킬 | 목적 | 선정 사유 |
|---|---|---|
| `git-guardrails-claude-code` | `push`, `reset --hard`, `clean` 등 hook 차단 | 규칙 위반 시 사후 발견이 아닌 사전 차단 |
| `grill-me` | 계획에 대한 질의 기반 검증 | brainstorming 이전 단계 보강 |
| `to-issues` | 계획 → GitHub 이슈 분해 | 개인 프로젝트 작업 단위 관리 |

## git-guardrails

원본 결함으로 개작판을 사용. 상세는 [git-guardrails (개작판)](git-guardrails.md).

## 중복 관계

- `tdd` ↔ superpowers `test-driven-development`, `diagnose` ↔ superpowers `systematic-debugging` → 설치 제외

## 평가 기준

| 항목 | 통과 조건 |
|---|---|
| 스킬 충돌 | superpowers 스킬과 동시 발동 · 오발동 없음 |
| git-guardrails | 차단 대상 명령 실행 시 hook 차단 확인, 일반 git 명령 지연 없음 |
| grill-me | 계획 단계 질문이 이후 설계 변경을 1건 이상 사전에 발견 |

## 운영 리스크

| 리스크 | 점검 신호 | 대응 |
|---|---|---|
| `misc/` 스킬의 유지보수 중단(frozen) — 결함이 보고되어도 수정되지 않음 | 이슈가 NOT_PLANNED로 종료 | 사용 스킬은 개작판으로 자체 유지 |
| 개인 저장소 특성상 스킬명 · 구성의 예고 없는 변경 | 저장소 내 deprecated 폴더 이동, 스킬 수 변동 | 사용 스킬만 고정 버전으로 사본 관리 |
| 저장소별 초기 설정(`setup-matt-pocock-skills`) 필요 | 레포 증가 시 설정 누락 | 필요 레포에만 한정 적용 |
| `to-issues`, `triage` 계열의 GitHub Issues 전제 | 사내 이슈 시스템 사용 레포에서 미동작 | 개인 프로젝트에 한정 |

## 설치 · 제거

```bash
npx skills@latest add mattpocock/skills   # 설치 시 스킬 선택
# 제거: 설치 경로 확인 후 기재
```

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-11-05 | Assess | superpowers 미보유 영역 보완 후보 |
