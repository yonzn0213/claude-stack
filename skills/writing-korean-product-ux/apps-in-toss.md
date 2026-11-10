# 앱인토스(토스 미니앱) 전용 규칙

2026-11 기준. 출처는 맨 아래. 정책은 자주 바뀌므로 출시 전에 공식 문서를 다시 본다.

## 만들기 전에

- **토스 앱에서 같은 이름을 먼저 검색한다.** 계산기·변환기처럼 AI로 하루 만에 만드는 앱은 수십~수백 개가 있고 리뷰가 거의 없다(주휴수당 계산기 사례, 2026-11). 그런 칸은 레드오션이 아니라 아무도 못 버는 칸일 수 있다.
- 미니앱 1만 개를 넘었고, 토스가 등록된 앱 전체를 재검수해 기준 미달 앱의 노출을 끊고 있다.
- 다른 앱의 구성·디자인을 가져와 문구만 바꾸면 안 된다. AI·템플릿으로 만든 앱은 특히 주의하라고 명시돼 있다.

## 검수에서 막히는 것

- 라이트 모드만 쓴다. 핀치 줌은 지도처럼 꼭 필요할 때만 쓴다.
- `eval`·`new Function` 같은 외부 코드 실행을 쓰지 않는다. 외부 사이트로 내보내지 않는다.
- 토스 내비게이션 바와 겹치는 뒤로 가기 버튼을 따로 만들지 않는다.
- 탭바는 필수가 아니다. 쓰려면 토스가 주는 플로팅 형태를 유지하고, 탭은 2~5개로 한다.
- 로고는 600×600 각진 정사각형이다. 둥근 모서리를 쓰지 않고, 라이트·다크 모두에서 보이는 배경을 넣는다. 브랜드 이름은 특별한 이유가 없으면 한글로 쓴다.
- 출시 불가 다크패턴:
  1. 들어오자마자 화면을 덮는 광고·알림 동의 바텀시트
  2. 뒤로 가기를 누를 때 알림 동의를 유도하는 바텀시트
  3. 유도한 CTA를 누르는 것 말고는 나갈 길이 없는 화면
  4. 예상하지 못한 순간에 뜨는 전면 광고
  5. CTA만 보고 다음 행동을 알 수 없는 라벨, CTA 위의 과장·중복 설명
- 광고 수익이 5천 원을 넘거나 리워드·결제를 붙이면 사업자 등록이 필요하다.

## TDS(토스 디자인 시스템) 값

TDS 컴포넌트(React)는 쓰지 않아도 된다. 바닐라 웹이면 아래 값을 CSS 변수로 옮긴다.

| 토큰 | 값 |
|---|---|
| grey50 / 100 / 200 / 300 / 400 | #f9fafb / #f2f4f6 / #e5e8eb / #d1d6db / #b0b8c1 |
| grey500 / 600 / 700 / 800 / 900 | #8b95a1 / #6b7684 / #4e5968 / #333d4b / #191f28 |
| blue50 / 100 / 500 / 600 / 700 | #e8f3ff / #c9e2ff / #3182f6 / #2272eb / #1b64da |
| red50 / 500 | #ffeeee / #f04452 |
| green500 / orange500 | #03b26c / #fe9800 |

글자 크기(px/행간): Typography 1 30/40, 2 26/35, 3 22/31, 4 20/29, 5 17/25.5(본문), 6 15/22.5, 7 13/19.5. 기기의 "더 큰 텍스트" 설정을 따라가도록 rem으로 쓴다.

화면 구성 관례: 흰 바탕, 구역 사이는 16px 회색(grey100) 띠(Border), 구역 제목 ListHeader(20px bold), 줄 단위 ListRow, 선택은 SegmentedControl(grey100 트랙 + 흰 선택 칸), 켜고 끄기는 Switch, 주된 행동은 화면 아래 고정 버튼(FixedBottomCTA).

그래픽: 아이콘 24~40px, 한 화면에 핵심 그래픽 하나, 아이콘·이모지 두 개 이상 나란히 조합 금지, 오류가 아닌데 느낌표 금지, 기다릴 필요가 없는데 로딩 애니메이션 금지, 파티클·과한 그라데이션 금지.

## 개발 설정 (SDK 3.x)

1. `npm install @apps-in-toss/web-framework` → `npx ait init --app-name <콘솔 appName>`
2. **`apps-in-toss.config.ts`를 꼭 열어 본다.** PowerShell에서 값을 파이프로 넘기면 `webBundleDir`에 BOM 글자가 섞인다(`'癤풼ist'`). `'dist'`로 고친다.
3. init이 Vite `plugins` 배열을 못 찾으면 직접 넣는다: `import aitDevtools from '@apps-in-toss/devtools/unplugin'` → `plugins: [aitDevtools.vite()]`. devtools는 개발 서버에서만 켜지고 빌드에는 0바이트다.
4. `npm run build`가 `vite build && ait build`로 `<appName>.ait`를 만든다. `*.ait`는 git에서 뺀다.
5. 저장은 SDK `Storage`(앱을 꺼도 유지)를 쓰되, 토스 밖에서는 응답이 안 올 수 있으니 시간 제한을 두고 localStorage로 대신한다.
6. appName은 바꿀 수 없는 고유 ID다. 콘솔에서 이미 쓰이고 있으면 다른 이름을 넣어야 한다.

## 출처

- 처음 연 사람도 헤매지 않는 화면의 3가지 조건: https://toss.im/apps-in-toss/blog/mini-app-ux-screen-design-guide
- UI/UX 가이드(UX 라이팅·다크패턴·로고): https://developers-apps-in-toss.toss.im/design/consumer-ux-guide.md
- TDS 컴포넌트: https://developers-apps-in-toss.toss.im/design/components
- TDS 색·글자: https://tossmini-docs.toss.im/tds-mobile/foundation/colors/ , /typography/
- 미니앱 1만 개·재검수: https://toss.im/newsroom/apps-in-toss-10000
