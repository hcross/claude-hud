import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderUsageLine } from '../dist/render/lines/usage.js';
import { renderIdentityLine } from '../dist/render/lines/identity.js';
import { formatResetTime } from '../dist/render/format-reset-time.js';
import { formatTokensCompact } from '../dist/utils/format.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripAnsi(str) {
  return str
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '');
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function baseUsageContext() {
  return {
    stdin: {
      model: { display_name: 'Opus' },
      context_window: {
        context_window_size: 200000,
        current_usage: {
          input_tokens: 10000,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
        },
      },
    },
    transcript: { tools: [], skills: [], mcpServers: [], agents: [], todos: [] },
    claudeMdCount: 0,
    rulesCount: 0,
    mcpCount: 0,
    hooksCount: 0,
    sessionDuration: '',
    gitStatus: null,
    usageData: {
      fiveHour: 25,
      sevenDay: 40,
      fiveHourResetAt: new Date(Date.now() + 3 * HOUR + 32 * MINUTE),
      sevenDayResetAt: new Date(Date.now() + 3 * DAY + 14 * HOUR),
      balanceLabel: 'Ollama Pro',
    },
    memoryUsage: null,
    config: {
      lineLayout: 'compact',
      showSeparators: false,
      pathLevels: 1,
      elementOrder: ['project', 'context', 'usage'],
      gitStatus: { enabled: true, showDirty: true, showAheadBehind: false, showFileStats: false, branchOverflow: 'truncate', pushWarningThreshold: 0, pushCriticalThreshold: 0 },
      display: { showModel: true, showProject: true, showContextBar: true, contextValue: 'percent', showConfigCounts: true, showCost: false, showDuration: true, showSpeed: false, showTokenBreakdown: true, showUsage: true, usageValue: 'percent', usageBarEnabled: false, showResetLabel: true, showTools: true, showSkills: false, showMcp: false, showAgents: true, showTodos: true, showSessionTokens: false, showSessionName: false, showClaudeCodeVersion: false, showMemoryUsage: false, showPromptCache: false, showOutputStyle: false, mergeGroups: [['context', 'usage']], autocompactBuffer: 'enabled', usageThreshold: 0, sevenDayThreshold: 80, environmentThreshold: 0, customLine: '' },
      colors: {
        context: 'green',
        usage: 'brightBlue',
        warning: 'yellow',
        usageWarning: 'brightMagenta',
        critical: 'red',
        model: 'cyan',
        project: 'yellow',
        git: 'magenta',
        gitBranch: 'cyan',
        label: 'dim',
        custom: 208,
      },
    },
  };
}

// ---------------------------------------------------------------------------
// formatTokensCompact
// ---------------------------------------------------------------------------

test('formatTokensCompact: raw counts below 1k stay integers', () => {
  assert.equal(formatTokensCompact(135), '135');
  assert.equal(formatTokensCompact(999), '999');
  assert.equal(formatTokensCompact(0), '0');
});

test('formatTokensCompact: thousands with one decimal, trailing zero trimmed', () => {
  assert.equal(formatTokensCompact(3400), '3.4k');
  assert.equal(formatTokensCompact(1000), '1k');
  assert.equal(formatTokensCompact(1500), '1.5k');
});

test('formatTokensCompact: millions with two decimals, trailing zeros trimmed', () => {
  assert.equal(formatTokensCompact(1230000), '1.23m');
  assert.equal(formatTokensCompact(1500000), '1.5m');
  assert.equal(formatTokensCompact(1000000), '1m');
});

// ---------------------------------------------------------------------------
// formatResetTime compact option
// ---------------------------------------------------------------------------

test('compact: hours+minutes drop the separator and the m unit', () => {
  const result = formatResetTime(new Date(Date.now() + 2 * HOUR + 30 * MINUTE), 'relative', { hourCycle: 'auto', showSeconds: false, compact: true });
  assert.match(result, /^2h30$/);
});

test('compact: sub-hour durations keep the m unit', () => {
  const result = formatResetTime(new Date(Date.now() + 45 * MINUTE), 'relative', { hourCycle: 'auto', showSeconds: false, compact: true });
  assert.match(result, /^45m$/);
});

test('compact: whole hours stay bare', () => {
  const result = formatResetTime(new Date(Date.now() + 3 * HOUR), 'relative', { hourCycle: 'auto', showSeconds: false, compact: true });
  assert.match(result, /^3h$/);
});

test('compact: days+hours drop the separator', () => {
  const result = formatResetTime(new Date(Date.now() + 3 * DAY + 14 * HOUR), 'relative', { hourCycle: 'auto', showSeconds: false, compact: true });
  assert.match(result, /^3d14h$/);
});

test('compact: false preserves the spaced form', () => {
  const result = formatResetTime(new Date(Date.now() + 2 * HOUR + 30 * MINUTE), 'relative', { hourCycle: 'auto', showSeconds: false, compact: false });
  assert.match(result, /^2h 30m$/);
});

// ---------------------------------------------------------------------------
// renderUsageLine — compactResetTime
// ---------------------------------------------------------------------------

test('compactResetTime renders a clock glyph and drops the resets wording', () => {
  const ctx = baseUsageContext();
  ctx.config.display.compactResetTime = true;
  ctx.usageData.sevenDay = 85; // above sevenDayThreshold (80) so the weekly part renders
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /\(⏰3h32\)/);
  assert.match(line, /\(⏰3d14h\)/);
  assert.ok(!line.includes('resets'), 'compact mode must not include the resets wording');
});

test('compactResetTime overrides showResetLabel=false', () => {
  const ctx = baseUsageContext();
  ctx.config.display.compactResetTime = true;
  ctx.config.display.showResetLabel = false;
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /\(⏰3h32\)/);
});

test('compactResetTime=false keeps the wording', () => {
  const ctx = baseUsageContext();
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /resets in 3h 32m/);
});

// ---------------------------------------------------------------------------
// renderUsageLine — showBalanceLabel
// ---------------------------------------------------------------------------

test('showBalanceLabel=false hides the external balance label', () => {
  const ctx = baseUsageContext();
  ctx.config.display.showBalanceLabel = false;
  const line = stripAnsi(renderUsageLine(ctx));
  assert.ok(!line.includes('Ollama Pro'));
});

test('showBalanceLabel=true (default) appends the balance label', () => {
  const ctx = baseUsageContext();
  ctx.config.display.showBalanceLabel = true;
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /Ollama Pro/);
});

test('showBalanceLabel=false also hides the balance-only fallback line', () => {
  const ctx = baseUsageContext();
  ctx.config.display.showBalanceLabel = false;
  ctx.usageData.fiveHour = null;
  ctx.usageData.sevenDay = null;
  ctx.usageData.fiveHourResetAt = null;
  ctx.usageData.sevenDayResetAt = null;
  assert.equal(renderUsageLine(ctx), null);
});

// ---------------------------------------------------------------------------
// renderUsageLine — labelOverrides
// ---------------------------------------------------------------------------

test('labelOverrides replaces the usage label', () => {
  const ctx = baseUsageContext();
  ctx.config.display.labelOverrides = { usage: 'Usg' };
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /Usg /);
  assert.ok(!/\bUsage /.test(line), 'the locale label must be replaced');
});

test('labelOverrides replaces the weekly label', () => {
  const ctx = baseUsageContext();
  ctx.config.display.labelOverrides = { weekly: 'Wkl' };
  ctx.usageData.sevenDay = 85; // above sevenDayThreshold (80) so the weekly part renders
  const line = stripAnsi(renderUsageLine(ctx));
  assert.match(line, /Wkl /);
  assert.ok(!/\bWeekly /.test(line));
});

// ---------------------------------------------------------------------------
// renderIdentityLine — showContextTokens
// ---------------------------------------------------------------------------

test('showContextTokens appends the human-readable token count', () => {
  const ctx = baseUsageContext();
  ctx.config.display.showContextTokens = true;
  const line = stripAnsi(renderIdentityLine(ctx));
  // 10000 input tokens → "10k tk"
  assert.match(line, /\(10k tk\)/);
});

test('showContextTokens=false (default) renders no token count', () => {
  const ctx = baseUsageContext();
  const line = stripAnsi(renderIdentityLine(ctx));
  assert.ok(!line.includes('tk)'));
});

test('showContextTokens skips rendering when no token data', () => {
  const ctx = baseUsageContext();
  ctx.config.display.showContextTokens = true;
  ctx.stdin.context_window.current_usage = undefined;
  const line = stripAnsi(renderIdentityLine(ctx));
  assert.ok(!line.includes('tk)'));
});