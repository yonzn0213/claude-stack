# Herdr

| 항목 | 내용 |
|---|---|
| 유형 | CLI (터미널 멀티플렉서) |
| 상태 | Trial |
| 원본 | https://github.com/herdrdev/herdr |
| 라이선스 | Apache-2.0 |
| 버전 | 0.9.5 (stable, x86_64-pc-windows-msvc) |
| 도입일 | 2026-11-05 |
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

## 설치 스크립트 검토 (`install.ps1`, 2026-11-05)

| 항목 | 결과 |
|---|---|
| 다운로드 출처 | `herdr.dev/latest.json` 매니페스트 → 바이너리는 GitHub Releases(`herdrdev/herdr`) |
| 무결성 검증 | SHA-256 필수 — 체크섬 누락 · 불일치 시 설치 중단 |
| 설치 위치 | `%USERPROFILE%\.herdr\packages\standalone\releases\<버전>`, junction `%LOCALAPPDATA%\Programs\Herdr\bin` |
| 시스템 변경 | 사용자 PATH(`HKCU\Environment`) 앞에 설치 경로 추가. 관리자 권한 · HKLM 변경 없음 |
| 기타 | 이전 버전 3개 보존(`-Retain`), 외부 프로세스 실행 · 원격 코드 평가 없음 |
| Windows 채널 | stable 매니페스트에 `windows-x86_64` 포함(0.9.5). 스크립트에 stable 미포함 시 preview로 전환하는 코드가 남아 있어 최근 stable 편입으로 판단 |

## 적용 방안

- Windows 네이티브 우선
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
| Windows 빌드의 stable 편입 직후 단계 | 렌더링 오류, 비정상 종료 | 이슈 트래커 확인, 재현 시 Hold |
| 빠른 릴리스 주기(0.9.4 → 0.9.5 핫픽스)와 0.x 버전의 설정 · 단축키 변경 가능성 (prefix `ctrl+s` → `ctrl+b` 변경 이력) | 업데이트 후 단축키 미동작 | 업데이트 전 릴리스 노트 확인 |
| 출력 패턴 기반 상태 판별 | Claude Code UI 변경 후 상태 오표시 | 공식 integration 적용 여부 검토 |
| 라이선스 변경 이력 (0.1.0 AGPL-3.0 → Apache-2.0) | — | 업무 환경 도입 시 해당 시점 라이선스 재확인 |

## 설치 · 제거

```powershell
# 설치 (Windows)
powershell -ExecutionPolicy Bypass -c "irm https://herdr.dev/install.ps1 | iex"

# 제거
Remove-Item -Recurse -Force "$env:USERPROFILE\.herdr", "$env:LOCALAPPDATA\Programs\Herdr"
# 사용자 PATH에서 %USERPROFILE%\.herdr\packages\standalone\releases\<버전> 항목 삭제
```

```bash
# macOS / Linux
curl -fsSL https://herdr.dev/install.sh | sh   # 또는 brew install herdr
```

## 결정 이력

| 날짜 | 상태 | 사유 |
|---|---|---|
| 2026-11-05 | Assess | 다중 세션 운용 시 입력 대기 세션 식별 비용. 설치 스크립트 검토 완료 |
| 2026-11-05 | Trial | 검토한 `install.ps1` 사본으로 설치, 평가 기준 대비 1일 운용 시작 |
