#!/usr/bin/env bash
# Salesforce 메타데이터 역참조 스캔
# 사용법: where-used.sh <API명> [패키지디렉터리]
#   예:   where-used.sh MaterialCode__c force-app
#
# 단어 경계를 적용해 부분 문자열 오탐을 제거한다.
# (예: AccountCode__c 검색 시 InputAccountCode__c 가 걸리는 문제)
set -uo pipefail

TARGET="${1:-}"
PKG="${2:-force-app}"

if [[ -z "$TARGET" ]]; then
  echo "사용법: where-used.sh <API명> [패키지디렉터리]" >&2
  exit 2
fi
if [[ ! -d "$PKG" ]]; then
  echo "패키지 디렉터리를 찾을 수 없습니다: $PKG" >&2
  exit 2
fi

# 커스텀 필드/객체(__c)는 관계 형태(__r)도 함께 찾는다
BASE="${TARGET%__c}"
if [[ "$TARGET" == *__c ]]; then
  PATTERN="(^|[^A-Za-z0-9_])(${TARGET}|${BASE}__r)([^A-Za-z0-9_]|\$)"
else
  PATTERN="(^|[^A-Za-z0-9_])${TARGET}([^A-Za-z0-9_]|\$)"
fi

FILES=$(grep -rlE --exclude-dir=node_modules --exclude-dir=.sfdx --exclude-dir=.git \
        "$PATTERN" "$PKG" 2>/dev/null)

if [[ -z "$FILES" ]]; then
  echo "레포 기준 참조 없음: $TARGET"
  echo "(주의: org에서 관리자가 만든 Flow/리포트/리스트뷰는 레포에 없습니다 — 3단계 org 조회 필요)"
  exit 0
fi

classify() {
  case "$1" in
    *.cls)                      echo "배포차단|Apex 클래스" ;;
    *.trigger)                  echo "배포차단|트리거" ;;
    *.flow-meta.xml)            echo "런타임위험|Flow" ;;
    *.validationRule-meta.xml)  echo "배포차단|검증규칙" ;;
    *.workflow-meta.xml)        echo "배포차단|워크플로" ;;
    *.field-meta.xml)           echo "배포차단|필드정의/수식" ;;
    *.layout-meta.xml)          echo "배포차단|페이지레이아웃" ;;
    *.compactLayout-meta.xml)   echo "배포차단|컴팩트레이아웃" ;;
    *.fieldSet-meta.xml)        echo "배포차단|필드셋" ;;
    *.permissionset-meta.xml)   echo "배포차단|권한세트" ;;
    *.profile-meta.xml)         echo "배포차단|프로파일" ;;
    *.sharingRules-meta.xml)    echo "배포차단|공유규칙" ;;
    *.duplicateRule-meta.xml|*.matchingRule-meta.xml) echo "배포차단|중복/매칭규칙" ;;
    *.assignmentRules-meta.xml|*.escalationRules-meta.xml) echo "배포차단|할당/에스컬레이션" ;;
    *.report-meta.xml)          echo "배포차단|리포트" ;;
    *.dashboard-meta.xml)       echo "배포차단|대시보드" ;;
    *.object-meta.xml)          echo "배포차단|객체 정의" ;;
    *.listView-meta.xml)        echo "배포차단|리스트뷰" ;;
    *.flexipage-meta.xml)       echo "배포차단|Lightning 레코드페이지" ;;
    *.quickAction-meta.xml)     echo "배포차단|빠른 실행" ;;
    *.recordType-meta.xml)      echo "배포차단|레코드타입" ;;
    *.webLink-meta.xml)         echo "배포차단|버튼/링크" ;;
    *.businessProcess-meta.xml) echo "배포차단|비즈니스 프로세스" ;;
    *.globalValueSet-meta.xml)  echo "배포차단|전역 선택목록" ;;
    *.index-meta.xml)           echo "배포차단|커스텀 인덱스" ;;
    *.md-meta.xml)              echo "런타임위험|커스텀 메타데이터" ;;
    *.resource|*.resource-meta.xml) echo "런타임위험|정적 리소스" ;;
    *.email|*.emailTemplate-meta.xml) echo "런타임위험|이메일템플릿" ;;
    *.page|*.component)         echo "배포차단|Visualforce" ;;
    *.translation-meta.xml|*.objectTranslation-meta.xml) echo "배포차단|번역" ;;
    *.cmp|*.evt|*.app)          echo "런타임위험|Aura" ;;
    *.html)                     echo "런타임위험|LWC 템플릿" ;;
    *.js)                       echo "런타임위험|LWC/Aura JS" ;;
    *.js-meta.xml)              echo "배포차단|LWC 메타" ;;
    *)                          echo "확인필요|기타" ;;
  esac
}

echo "== 역참조 분석: $TARGET  (패키지: $PKG) =="
echo

TOTAL=0
TMP=$(mktemp)
while IFS= read -r f; do
  [[ -z "$f" ]] && continue
  printf '%s\t%s\n' "$(classify "$f")" "$f" >> "$TMP"
  TOTAL=$((TOTAL+1))
done <<< "$FILES"

for sev in 배포차단 런타임위험 확인필요; do
  n=$(awk -F'|' -v s="$sev" '$1==s' "$TMP" | wc -l | tr -d ' ')
  [[ "$n" -eq 0 ]] && continue
  case "$sev" in
    배포차단)   echo "## 배포 차단 ($n) — 수정하지 않으면 배포 실패" ;;
    런타임위험) echo "## 런타임 위험 ($n) — 배포는 성공하고 조용히 깨짐" ;;
    확인필요)   echo "## 분류 미상 ($n) — 직접 확인 필요" ;;
  esac
  awk -F'\t' -v s="$sev" 'index($1, s"|")==1 { split($1,a,"|"); print a[2] "\t" $2 }' "$TMP" \
    | sort | awk -F'\t' '{ printf "  [%-16s] %s\n", $1, $2 }'
  echo
done

rm -f "$TMP"
echo "총 참조 파일: $TOTAL"
echo
echo "다음 단계: org 조회(관리자 생성 Flow/리포트/리스트뷰, 데이터 존재 여부) + 변경 이력(git log -S) 확인"
