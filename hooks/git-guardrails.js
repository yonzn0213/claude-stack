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
const PUSH_RULE = "git push";

// 혼자 관리하는 레포(SaaS 메타데이터 이력 관리 등)는 push 확인이 실익 없이 흐름만 끊는다.
// 레포별로 한 번 묻고, 사용자가 원하면 이 목록에 넣어 그 레포의 일반 push만 확인을 생략한다.
// force push(deny)와 다른 ask 규칙은 목록과 무관하게 유지.
const path = require("path");
const fs = require("fs");
const TRUST_FILE = path.join(__dirname, "git-guardrails.trusted.json");

function normalizeDir(dir) {
  return path.resolve(dir).replace(/\\/g, "/").replace(/\/+$/, "").toLowerCase();
}

// worktree의 .git은 파일("gitdir: <메인>/.git/worktrees/<이름>")이라 메인 레포 루트로 환원해야
// 같은 레포로 인정된다.
function findRepoRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    const dotGit = path.join(dir, ".git");
    let stat = null;
    try { stat = fs.statSync(dotGit); } catch { /* 없음 */ }
    if (stat && stat.isDirectory()) return dir;
    if (stat && stat.isFile()) {
      const match = /gitdir:\s*(.+)/.exec(fs.readFileSync(dotGit, "utf8"));
      const gitDir = match ? path.resolve(dir, match[1].trim()) : "";
      const worktreeMarker = gitDir.replace(/\\/g, "/").search(/\/\.git\/worktrees\//);
      return worktreeMarker >= 0 ? gitDir.slice(0, worktreeMarker) : dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// `git -C <dir> push`면 cwd가 아니라 그 폴더의 레포가 대상.
function targetDir(command, cwd) {
  const match = /\bgit\s+-C\s+("([^"]+)"|'([^']+)'|(\S+))/.exec(command);
  const explicit = match && (match[2] || match[3] || match[4]);
  if (!explicit) return cwd;
  return path.isAbsolute(explicit) ? explicit : path.resolve(cwd || ".", explicit);
}

function loadTrusted(trustFile = TRUST_FILE) {
  try {
    const data = JSON.parse(fs.readFileSync(trustFile, "utf8"));
    return new Set((data.pushWithoutAsk || []).map(normalizeDir));
  } catch {
    return new Set();
  }
}

function isPushTrusted(command, cwd, trusted) {
  const dir = targetDir(command, cwd);
  if (!dir) return false;
  const root = findRepoRoot(dir);
  return Boolean(root) && trusted.has(normalizeDir(root));
}

function stripQuoted(command) {
  return command.replace(/'[^']*'|"(?:[^"\\]|\\.)*"/g, "''");
}

function decide(toolName, command, cwd = null, trusted = new Set()) {
  if (!INSPECTED_TOOLS.has(toolName) || typeof command !== "string") return null;
  for (const rule of DENY_RULES) {
    if (rule.pattern.test(command)) return { decision: "deny", rule: rule.name };
  }
  const unquoted = stripQuoted(command);
  for (const rule of ASK_RULES) {
    if (!rule.pattern.test(unquoted)) continue;
    if (rule.name === PUSH_RULE && isPushTrusted(command, cwd, trusted)) continue;
    return { decision: "ask", rule: rule.name };
  }
  return null;
}

function respond(result) {
  const pushHint = result.rule === PUSH_RULE
    ? " 이 레포는 앞으로 push 확인이 필요 없다면 Claude에게 \"이 레포 push 확인 꺼줘\"라고 말하세요."
    : "";
  const reason = result.decision === "deny"
    ? `git-guardrails: ${result.rule}는 사용자 규칙상 절대 금지입니다. 필요하면 사용자가 직접 실행해야 합니다.`
    : `git-guardrails: ${result.rule}는 실행 전 사용자 확인이 필요합니다.${pushHint}`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: result.decision,
      permissionDecisionReason: reason,
    },
  }));
}

// `node git-guardrails.js trust <레포 경로>` / `untrust <경로>` / `list` — 신뢰 목록 관리
function manageTrust(action, target) {
  let data = { pushWithoutAsk: [] };
  try { data = JSON.parse(fs.readFileSync(TRUST_FILE, "utf8")); } catch { /* 새로 만듦 */ }
  const entries = new Set((data.pushWithoutAsk || []).map(normalizeDir));
  if (action !== "list") {
    const root = findRepoRoot(target || process.cwd());
    if (!root) { console.error(`git 레포가 아닙니다: ${target}`); process.exit(1); }
    if (action === "trust") entries.add(normalizeDir(root));
    else entries.delete(normalizeDir(root));
    data.pushWithoutAsk = [...entries].sort();
    fs.writeFileSync(TRUST_FILE, JSON.stringify(data, null, 2) + "\n", "utf8");
  }
  console.log([...entries].sort().join("\n") || "(비어 있음)");
}

if (require.main === module && ["trust", "untrust", "list"].includes(process.argv[2])) {
  manageTrust(process.argv[2], process.argv[3]);
} else if (require.main === module) {
  let raw = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => { raw += chunk; });
  process.stdin.on("end", () => {
    try {
      const input = JSON.parse(raw);
      const result = decide(input.tool_name, input.tool_input && input.tool_input.command, input.cwd, loadTrusted());
      if (result) respond(result);
    } catch {
      // fail-open: 위 주석 참고
    }
    process.exit(0);
  });
}

module.exports = { decide, findRepoRoot, loadTrusted, normalizeDir };
