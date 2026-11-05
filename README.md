# claude-stack

Claude Code 기반 개발 환경에서 운용 중인 플러그인 · 스킬 · CLI 도구의 도입 판단과 운영 기록.

- 도구별 도입 배경, 사용 범위, 운영 리스크, 제거 절차를 관리
- 상태 분류는 [Tech Radar](https://www.thoughtworks.com/radar/faq) 4단계 + 제거(Retired)
- 모든 상태 변경은 [CHANGELOG](CHANGELOG.md)에 날짜와 사유로 기록

## Radar

| 도구 | 유형 | 상태 | 버전 | 역할 |
|---|---|---|---|---|
| [superpowers](tools/superpowers.md) | Plugin | Adopt | 7.0.0 | 설계 → 계획 → TDD → 리뷰 절차 강제 |
| [impeccable](tools/impeccable.md) | Skill | Adopt | 4.3.1 | 구현된 UI 점검 · 개선 |
| [design-taste-frontend](tools/design-taste-frontend.md) | Skill | Adopt | — | 신규 UI 제작 시 디자인 품질 기준 |
| [ui-ux-pro-max](tools/ui-ux-pro-max.md) | Skill | Adopt | — | 프로젝트 초기 디자인 시스템 선정 |
| [sf-where-used](tools/sf-where-used.md) | Skill (자체 제작) | Adopt | — | Salesforce 메타데이터 역참조 분석 |
| [mattpocock/skills](tools/mattpocock-skills.md) | Skill set | Trial | — | 선택형 엔지니어링 스킬 모음 (git-guardrails 개작판 사용) |
| [Herdr](tools/herdr.md) | CLI | Assess | 0.9.5 (stable) | 다중 에이전트 세션 관리 |

## 상태 기준

| 상태 | 기준 |
|---|---|
| Adopt | 검증 완료, 기본 환경에 포함 |
| Trial | 제한된 범위에서 실사용 중, 평가 기준 대비 판정 전 |
| Assess | 정보 수집 단계, 미설치 |
| Hold | 설치 유지 또는 도입 보류, 신규 사용 중단 |
| Retired | 제거 완료, 사유와 제거 절차 보존 |

## 운영 원칙

- 역할이 겹치는 도구는 동시에 활성화하지 않음 — 각 문서의 `중복 관계` 참고
- Trial 진입 시 평가 기준을 먼저 정의하고, 기준 충족 여부로만 Adopt / Hold 판정
- 수동 설치 도구는 원본 저장소 변경 여부를 분기 1회 확인

## 구성

```
tools/             도구별 운영 문서
skills/            자체 제작 스킬 원본
hooks/             Claude Code hook (개작 포함)
templates/tool.md  운영 문서 템플릿
CHANGELOG.md       상태 변경 이력
```

## 환경

Claude Code · Windows 11 · Salesforce(Apex, LWC) · TypeScript · Python
