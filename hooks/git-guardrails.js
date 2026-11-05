#!/usr/bin/env node
// PreToolUse hook — 위험 git 명령을 CLAUDE.md 「도구 실행 권한」 규칙에 맞춰 차단/확인 요청.
// 원본 아이디어: mattpocock/skills git-guardrails-claude-code (MIT).
// 원본과 다른 점과 이유:
//   - Bash만이 아니라 PowerShell 도구도 검사 (Windows에서 PowerShell 경유로 우회되는 구멍)
//   - 일반 push는 deny가 아닌 ask — CLAUDE.md는 push를 "실행 전 확인"으로, force push만 "절대 금지"로 구분
//   - jq 대신 node — hook 실행 환경 PATH에 jq가 없을 수 있음
//   - 파싱 실패 시 통과(fail-open) — hook 오류로 모든 셸 명령이 막히는 것보다 기존 권한 체계에 맡기는 편이 안전

const GIT_PREFIX = String.raw`\bgit(?:\s+-[cC]\s+\S+|\s+--[\w-]+(?:=\S+)?)*\s+`;

// 따옴표 안 문자열(커밋 메시지 등)은 ask 판정에서 제외해 오탐을 줄인다.
// deny 판정은 원문 기준 — 금지 명령은 오탐이 나더라도 막는 쪽을 택한다.
const DENY_RULES = [
  { name: "force push", pattern: new RegExp(GIT_PREFIX + String.raw`push\b[^\n;&|]*?(?:\s--force(?:-with-lease|-if-includes)?\b|\s-[a-zA-Z]*f[a-zA-Z]*\b|\s\+\S+|\s--mirror\b)`) },
];

const ASK_RULES = [
  { name: "git push", pattern: new RegExp(GIT_PREFIX + String.raw`push\b`) },
  { name: "git rebase", pattern: new RegExp(GIT_PREFIX + String.raw`rebase\b`) },
  { name: "git reset --hard", pattern: new RegExp(GIT_PREFIX + String.raw`reset\b[^\n;&|]*\s--hard\b`) },
  { name: "git clean -f", pattern: new RegExp(GIT_PREFIX + String.raw`clean\b[^\n;&|]*\s-[a-zA-Z]*f`) },
  { name: "git branch -D", pattern: new RegExp(GIT_PREFIX + String.raw`branch\b[^\n;&|]*\s(?:-D\b|--delete\s+--force\b)`) },
  { name: "git checkout/restore .", pattern: new RegExp(GIT_PREFIX + String.raw`(?:checkout|restore)\b[^\n;&|]*\s(?:--\s+)?\.(?:\s|$)`) },
];

const INSPECTED_TOOLS = new Set(["Bash", "PowerShell"]);

function stripQuoted(command) {
  return command.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, "''");
}

function decide(toolName, command) {
  if (!INSPECTED_TOOLS.has(toolName) || typeof command !== "string") return null;
  for (const rule of DENY_RULES) {
    if (rule.pattern.test(command)) return { decision: "deny", rule: rule.name };
  }
  const unquoted = stripQuoted(command);
  for (const rule of ASK_RULES) {
    if (rule.pattern.test(unquoted)) return { decision: "ask", rule: rule.name };
  }
  return null;
}

function respond(result) {
  const reason = result.decision === "deny"
    ? `git-guardrails: ${result.rule}는 사용자 규칙상 절대 금지입니다. 필요하면 사용자가 직접 실행해야 합니다.`
    : `git-guardrails: ${result.rule}는 실행 전 사용자 확인이 필요합니다.`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: result.decision,
      permissionDecisionReason: reason,
    },
  }));
}

if (require.main === module) {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { raw += chunk; });
  process.stdin.on("end", () => {
    try {
      const input = JSON.parse(raw);
      const result = decide(input.tool_name, input.tool_input && input.tool_input.command);
      if (result) respond(result);
    } catch {
      // fail-open: 위 주석 참고
    }
    process.exit(0);
  });
}

module.exports = { decide };
