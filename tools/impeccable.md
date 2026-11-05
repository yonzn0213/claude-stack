# impeccable

| 항목 | 내용 |
|---|---|
| 유형 | Skill |
| 상태 | Adopt |
| 원본 | https://github.com/pbakaus/impeccable |
| 라이선스 | Apache-2.0 |
| 버전 | 4.3.1 |
| 도입일 | 2026-09-11 |
| 최종 확인 | 2026-11-05 |

## 개요

구현된 UI의 점검 · 개선 스킬. 정적 검출 룰 61종과 LLM 크리틱으로 시각 위계, 간격, 접근성, 색상, 모션 등을 진단.

## 도입 배경

UI 구현 후 품질을 판단할 객관적 기준 부재.

## 사용 범위

| 적용 | 비적용 |
|---|---|
| 랜딩 · 포트폴리오 · 개인 프로젝트 UI | Salesforce Lightning 내부 LWC — SLDS가 디자인을 강제하는 화면은 표준 화면과의 일관성이 우선 |
| Experience Cloud 포털 (Branding Set 범위 내) | |
| `audit` · `critique` · `polish` 명령, CLI `scripts/impeccable detect <경로\|URL>` | |

## 중복 관계

- design-taste-frontend: 신규 제작 / impeccable: 구현 후 점검

## 운영 리스크

| 리스크 | 점검 신호 | 대응 |
|---|---|---|
| 수동 설치로 자동 업데이트 없음 | 원본 저장소 신규 릴리스 | 분기 1회 버전 대조 |
| URL 스캔의 브라우저 의존 | 브라우저 업데이트 후 스캔 실패 | 로컬 경로 스캔으로 대체 |

## 설치 · 제거

```bash
rm -rf ~/.claude/skills/impeccable   # 제거
```

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-09-11 | Adopt | 구현 UI 점검 기준 확보 |
