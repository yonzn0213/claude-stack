---
name: sf-where-used
description: Salesforce 메타데이터 역참조 분석 — 필드/객체/Apex 클래스/LWC/메서드를 변경하거나 삭제하기 전에 영향받는 모든 메타데이터를 빠짐없이 찾습니다. "이거 지워도 되나", "이 필드 어디서 쓰나", "영향 범위" 요청에 사용. 요건 문서 영향분석(impact-analysis)과 다릅니다 — 이 스킬은 코드/메타데이터 대상입니다.
argument-hint: <API명> (예: Account.Custom_Field__c, MyController, myLwcComponent)
---

# Salesforce 역참조 분석 (Where Is This Used)

Salesforce 표준 "Where Is This Used?"는 **Flow, 동적 SOQL, 하드코딩 문자열, 리포트를 놓칩니다.**
이 스킬은 그 빈칸을 메웁니다.

## 원칙

1. **레포 grep은 org의 진실이 아니다.** 운영에서 관리자가 만든 Flow·리포트·리스트뷰는 레포에 없습니다.
   grep 결과는 "최소 영향 범위"이고, org 조회로 보강해야 합니다.
2. **API명은 여러 형태로 등장한다.** `Field__c`, `'Field__c'`(문자열), `Field__r`(관계), 네임스페이스 접두사.
3. **부분 문자열 오탐을 제거한다.** `AccountCode__c`로 그냥 grep하면 `InputAccountCode__c`가 걸립니다.
   앞뒤로 `[^A-Za-z0-9_]` 경계를 반드시 붙입니다.
4. **실패 시점을 구분해서 보고한다.** 배포가 막히는 것과, 배포는 되고 런타임에 조용히 깨지는 것은 위험도가 다릅니다.

## 1단계 — 검색어 확장

대상이 `Account.Shipping_Grade__c`라면 검색어는 다음 전부입니다.

| 형태 | 예시 | 어디서 나오나 |
|------|------|--------------|
| API명 그대로 | `Shipping_Grade__c` | Apex, LWC, 메타데이터 XML |
| 관계 형태 | `Shipping_Grade__r` | Lookup/MD 관계 필드일 때 SOQL |
| 문자열 리터럴 | `'Shipping_Grade__c'` | 동적 SOQL, `Schema` describe, FieldSet |
| 라벨 | `배송 등급` | 수식, 검증규칙 에러 메시지, 번역 |
| 접두사 없는 이름 | `Shipping_Grade` | 리포트 컬럼, 일부 XML 노드 |

Apex 클래스/메서드가 대상이면 `ClassName`, `ClassName.method`, `'ClassName'`(동적 인스턴스화 `Type.forName`), 테스트 클래스까지.

## 2단계 — 메타데이터 전수 grep

패키지 디렉터리(`sfdx-project.json`의 `packageDirectories`) 전체를 대상으로 합니다.
**아래 표를 하나도 건너뛰지 마세요.** 실무에서 사고는 항상 "설마 저기까지" 하는 곳에서 납니다.

| # | 대상 | 파일 글롭 | 놓치면 생기는 일 |
|---|------|-----------|-----------------|
| 1 | Apex 클래스/트리거 | `**/*.cls`, `**/*.trigger` | 컴파일 실패 → 배포 차단 |
| 2 | 동적 SOQL 문자열 | 위와 동일, 따옴표 포함 검색 | **배포는 성공, 런타임 QueryException** |
| 3 | Flow / Subflow | `**/*.flow-meta.xml` | **배포는 성공, Flow 런타임 오류** |
| 4 | 검증 규칙 | `**/*.validationRule-meta.xml` | 배포 차단 |
| 5 | 워크플로/프로세스빌더 | `**/*.workflow-meta.xml` | 배포 차단 |
| 6 | 수식 필드 (타 객체 포함) | `**/*.field-meta.xml` | 배포 차단 |
| 7 | LWC | `**/lwc/**/*.js`, `*.html`, `*.js-meta.xml` | 화면 공백 / 콘솔 에러 |
| 8 | Aura | `**/aura/**/*.cmp`, `*.js`, `*.evt` | 화면 오류 |
| 9 | 페이지 레이아웃 | `**/*.layout-meta.xml` | 배포 차단 |
| 10 | 컴팩트 레이아웃 | `**/*.compactLayout-meta.xml` | 배포 차단 |
| 11 | 필드셋 | `**/*.fieldSet-meta.xml` | 배포 차단 |
| 12 | 리스트뷰 | `**/*.listView-meta.xml` (객체 XML 내부) | 배포 차단 |
| 13 | 권한 세트 | `**/*.permissionset-meta.xml` | 배포 차단 (FLS 항목 잔존) |
| 14 | 프로파일 | `**/*.profile-meta.xml` | 배포 차단 |
| 15 | 공유 규칙 | `**/*.sharingRules-meta.xml` | 배포 차단 |
| 16 | 할당/에스컬레이션 규칙 | `**/*.assignmentRules-meta.xml`, `*.escalationRules-meta.xml` | 배포 차단 |
| 17 | 중복/매칭 규칙 | `**/*.duplicateRule-meta.xml`, `*.matchingRule-meta.xml` | 배포 차단 |
| 18 | 리포트 / 대시보드 | `**/*.report-meta.xml`, `*.dashboard-meta.xml` | 배포 차단 또는 리포트 깨짐 |
| 19 | 이메일 템플릿 | `**/*.email`, `*.emailTemplate-meta.xml` | **머지필드 공백 출력** |
| 20 | 커스텀 메타데이터/설정 | `**/*.md-meta.xml`, `*.object-meta.xml` | 설정값 참조 실패 |
| 21 | Visualforce | `**/*.page`, `**/*.component` | 배포 차단 |
| 22 | 번역 | `**/*.translation-meta.xml`, `*.objectTranslation-meta.xml` | 배포 차단 |
| 23 | 플랫폼 이벤트/변경데이터캡처 | `**/*.object-meta.xml` (`__e`) | 구독자 런타임 실패 |
| 24 | 정적 리소스 내 JS | `**/staticresources/**` | 조용한 실패 |

실행은 동봉 스크립트를 사용합니다. **단어 경계가 적용되어 있어** 부분 문자열 오탐이 없습니다.

```bash
bash ~/.claude/skills/sf-where-used/scripts/where-used.sh <API명> [패키지디렉터리]
# 예: bash ~/.claude/skills/sf-where-used/scripts/where-used.sh MaterialCode__c force-app
```

스크립트는 히트 파일을 **배포 차단 / 런타임 위험 / 분류 미상**으로 나눠 출력합니다.
`분류 미상`이 나오면 그 확장자를 스크립트 `classify()`에 추가하세요 — 커버리지 구멍이라는 뜻입니다.

직접 grep할 때는 반드시 단어 경계를 넣으세요. `rg`는 이 환경의 Bash PATH에 없으므로 `grep -rE`를 씁니다.

```bash
grep -rlE --exclude-dir=node_modules --exclude-dir=.sfdx \
  "(^|[^A-Za-z0-9_])(Shipping_Grade__c|Shipping_Grade__r)([^A-Za-z0-9_]|$)" force-app
```

XML은 라인이 길어 잘리므로, 히트한 파일은 해당 노드 주변을 다시 열어 **어떤 태그 안에서** 쓰였는지 확인하세요.
(`<field>`, `<elementReference>`, `<leftValueReference>`, `<errorConditionFormula>`, `<columns>` 등)

## 3단계 — org 조회로 보강 (레포에 없는 것)

레포 grep이 끝나면 반드시 org 쪽을 확인합니다. Salesforce DX MCP가 붙어 있으면 그걸 쓰고,
없으면 `sf` CLI로 조회합니다. **운영 org는 읽기만 합니다.**

- 관리자가 org에서 직접 만든 Flow / 리포트 / 리스트뷰
- 해당 필드에 실제 데이터가 들어있는지: `SELECT COUNT(Id) FROM <Object> WHERE <Field> != null`
  → 값이 있으면 "안 쓰는 필드"가 아닙니다
- 마지막 수정자·수정일 (`SELECT ... FROM FieldDefinition` 또는 Tooling API)
- 외부 연동이 이 필드를 밀어넣고 있는지 (연동 스펙 문서 / Named Credential 사용처)

## 4단계 — 변경 이력 조회

`git log -S <API명>`, 커밋 메시지, 작업 기록 도구가 있다면 그 기록에서 해당 객체·클래스의 과거 변경 이유를 찾습니다.
"왜 이렇게 만들었는지"가 남아 있으면, 지우면 안 되는 이유가 거기 있는 경우가 많습니다.

## 출력 형식

```markdown
## 영향 분석: <대상 API명>

### 요약
- 참조 지점 **N곳** / 배포 차단 **N곳** / 런타임 위험 **N곳**
- 판정: 안전하게 변경 가능 / 선행 작업 필요 / 변경 비권장

### 배포 차단 (수정 안 하면 배포 실패)
| 파일 | 위치 | 참조 형태 |
|------|------|----------|

### 런타임 위험 (배포는 되지만 조용히 깨짐)
| 파일 | 위치 | 증상 |
|------|------|------|

### org 확인 필요 (레포에 없음)
- [ ] 항목

### 데이터 현황
- 값이 채워진 레코드: N건 (조회 쿼리: ...)

### 권장 순서
1. ...
```

## 하지 말 것

- 참조를 찾았다고 바로 수정하지 마세요. **보고만 하고 사용자 판단을 받습니다.**
- "grep에 안 나오니 안전합니다"라고 단정하지 마세요. 3단계를 안 했으면 "레포 기준 미발견, org 미확인"이라고 쓰세요.
- 운영 org에 쓰기 작업을 하지 마세요.
