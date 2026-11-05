# Herdr

| 항목 | 내용 |
|---|---|
| 유형 | CLI (터미널 멀티플렉서) |
| 상태 | Assess |
| 원본 | https://github.com/herdrdev/herdr |
| 라이선스 | Apache-2.0 |
| 버전 | 미설치 (공개 최신 0.4.x) |
| 도입일 | — |
| 최종 확인 | 2026-11-05 |

## 개요

코딩 에이전트 다중 실행용 터미널 멀티플렉서. Rust 단일 바이너리로 기존 터미널 내부에서 동작.

- 워크스페이스 · 타일형 pane, pane별 독립 PTY
- pane별 에이전트 상태 표시(working / blocked / idle) — hook 없이 포그라운드 프로세스와 출력 기반 판별
- 백그라운드 서버 기반 detach · reattach, 재시작 시 레이아웃 복원 및 지원 에이전트 세션 resume
- SSH 다중 호스트, CLI · 소켓 API, 플러그인
- 지원 에이전트: Claude Code, Codex, Cursor, OpenCode 등

## 도입 배경

Claude Code 세션 5개 이상 동시 운용 시, 권한 승인 대기 중인 세션을 찾기 위해 창을 순회해야 하는 문제.

## 적용 방안

- Windows 네이티브(베타) 우선 검토
  - 업무 도구(Outlook COM, sf CLI 인증, 작업 스케줄러)가 Windows 환경에 종속되어 WSL 내 실행 시 동작 불가
- 비긴급 세션 2~3개로 한정해 1일 운용 후 판정

## 평가 기준

| 항목 | 통과 조건 |
|---|---|
| 상태 판별 | Claude Code 권한 승인 대기 시 blocked 표시 정확 |
| 세션 유지 | 클라이언트 종료 후 reattach 시 세션 유지 |
| 한글 처리 | 한글 입력 · 출력 깨짐 없음 |
| 안정성 | 1일 운용 중 비정상 종료 없음 |

## 운영 리스크

| 리스크 | 점검 신호 | 대응 |
|---|---|---|
| Windows 지원 베타 단계 | 렌더링 오류, 비정상 종료 | WSL 운용 또는 Hold |
| 0.x 버전의 설정 · 단축키 변경 (prefix `ctrl+s` → `ctrl+b` 변경 이력) | 업데이트 후 단축키 미동작 | 업데이트 전 릴리스 노트 확인 |
| 출력 패턴 기반 상태 판별 | Claude Code UI 변경 후 상태 오표시 | 이슈 트래커 확인, 공식 integration 적용 여부 검토 |
| 라이선스 변경 이력 (0.1.0 AGPL-3.0 → Apache-2.0) | — | 업무 환경 도입 시 해당 시점 라이선스 재확인 |

## 설치 · 제거

```powershell
# Windows — 실행 전 스크립트 내용 확인
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"
```

```bash
# macOS / Linux
curl -fsSL https://herdr.dev/install.sh | sh   # 또는 brew install herdr
```

제거 절차는 설치 후 설치 경로 확인하여 기재.

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-11-05 | Assess | 다중 세션 운용 시 입력 대기 세션 식별 비용 |
