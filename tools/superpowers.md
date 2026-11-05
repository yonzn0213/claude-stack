# superpowers

| 항목 | 내용 |
|---|---|
| 유형 | Plugin |
| 상태 | Adopt |
| 원본 | https://github.com/obra/superpowers |
| 라이선스 | MIT |
| 버전 | 7.0.0 |
| 도입일 | 2026-04-02 |
| 최종 확인 | 2026-11-05 |

## 개요

코딩 에이전트의 작업 절차를 강제하는 스킬 프레임워크. 요구사항 확인 → 설계 → 단위 작업 계획 → TDD 구현 → 리뷰 순서를 세션 시작 시 주입되는 규칙으로 고정하고, 상황별 스킬(brainstorming, systematic-debugging 등)을 자동 발동.

## 도입 배경

에이전트가 요구사항 확인 없이 바로 구현에 들어가 재작업이 발생하는 문제. 설계 · 테스트 단계를 사람이 매번 지시하지 않아도 지켜지도록 절차 자체를 도구에 위임.

## 사용 범위

| 적용 | 비적용 |
|---|---|
| 신규 기능 개발 (brainstorming → writing-plans → subagent-driven-development) | 단건 문구 수정, 설정값 변경 등 단순 작업 |
| 버그 원인 분석 (systematic-debugging) | 조사 · 질의응답만 하는 세션 |
| 완료 전 검증 (verification-before-completion) | |

## 중복 관계

- mattpocock/skills의 `tdd`, `diagnose`와 역할 동일 → 해당 스킬은 설치 대상에서 제외

## 운영 리스크

| 리스크 | 점검 신호 | 대응 |
|---|---|---|
| `latest` 채널 자동 업데이트로 메이저 버전 변경 시 스킬명 · 흐름 변경 | 평소와 다른 스킬 발동, 기존 스킬명 미인식 | 릴리스 노트 확인, 필요 시 이전 버전 고정 |
| 서브에이전트 · 리뷰 단계 누적에 따른 토큰 비용 증가 | 단순 작업의 세션 비용 급증 | 단순 작업은 절차 생략을 명시적으로 지시 |
| 플러그인 기본 동작과 개인 규칙(CLAUDE.md) 충돌 | 커밋 형식 등 개인 규칙 미준수 | 개인 규칙 우선 원칙을 CLAUDE.md에 명시 유지 |

## 설치 · 제거

```bash
/plugin install superpowers@claude-plugins-official
/plugin uninstall superpowers@claude-plugins-official
```

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-04-02 | Adopt | 설계 · 테스트 단계 누락 방지 |
