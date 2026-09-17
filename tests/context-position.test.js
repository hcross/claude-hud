import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderIdentityLine, renderContextSegment } from '../dist/render/lines/identity.js';
import { renderProjectLine } from '../dist/render/lines/project.js';
import { renderUsageLine } from '../dist/render/lines/usage.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripAnsi(str) {
  return str
    .replace(/\x1b\[[0-9;]*m/g, '')
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '');
}

function baseContext() {
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
      cwd: '/Users/jarrod/dev/my-project',
    },
    transcript: { tools: [], skills: [], mcpServers: [], agents: [], todos: [], sessionTokens: undefined },
    claudeMdCount: 0,
    rulesCount: 0,
    mcpCount: 0,
    hooksCount: 0,
    sessionDuration: '',
    gitStatus: null,
    usageData: null,
    memoryUsage: null,
    config: {
      lineLayout: 'expanded',
      showSeparators: false,
      pathLevels: 1,
      elementOrder: ['project', 'context', 'usage', 'promptCache', 'memory', 'environment', 'tools', 'skills', 'mcp', 'agents', 'todos'],
      gitStatus: { enabled: true, showDirty: true, showAheadBehind: false, showFileStats: false, branchOverflow: 'truncate', pushWarningThreshold: 0, pushCriticalThreshold: 0 },
      jjStatus: { enabled: true, showDirty: true, showConflicts: true },
      display: { showModel: true, showProject: true, showContextBar: true, contextValue: 'percent', contextPosition: 'ownLine', showConfigCounts: true, showCost: false, showDuration: true, showSpeed: false, showTokenBreakdown: true, showUsage: true, usageValue: 'percent', usageBarEnabled: false, showResetLabel: true, showTools: true, showSkills: false, showMcp: false, showAgents: true, showTodos: true, showSessionTokens: false, showSessionName: false, showClaudeCodeVersion: false, showMemoryUsage: false, showPromptCache: false, showOutputStyle: false, mergeGroups: [['context', 'usage']], autocompactBuffer: 'enabled', usageThreshold: 0, sevenDayThreshold: 80, environmentThreshold: 0, customLine: '' },
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
// Default — contextPosition: 'ownLine'
// ---------------------------------------------------------------------------

test('ownLine (default): the context bar stays on its own labeled line', () => {
  const ctx = baseContext();
  const identity = stripAnsi(renderIdentityLine(ctx) ?? '');
  assert.match(identity, /^Context /);
  assert.match(identity, /█░* 5%/);

  const project = stripAnsi(renderProjectLine(ctx) ?? '');
  assert.ok(!project.includes('█'), 'the project line must not carry the context bar');
});

test('ownLine (default): the project line is byte-identical without the option', () => {
  const withOption = baseContext();
  withOption.config.display.contextPosition = 'ownLine';
  const withoutOption = baseContext();
  delete withoutOption.config.display.contextPosition;

  assert.equal(
    renderProjectLine(withOption),
    renderProjectLine(withoutOption),
  );
  assert.equal(renderIdentityLine(withOption), renderIdentityLine(withoutOption));
});

// ---------------------------------------------------------------------------
// projectLine — context bar inlined on the project line
// ---------------------------------------------------------------------------

test('projectLine: no standalone context line', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  assert.equal(renderIdentityLine(ctx), null);
});

test('projectLine: the bar is inlined between the model badge and the project', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  const line = stripAnsi(renderProjectLine(ctx) ?? '');

  const modelIdx = line.indexOf('[Opus]');
  const barIdx = line.indexOf('█');
  const valueIdx = line.indexOf('5%');
  const projectIdx = line.indexOf('my-project');
  assert.ok(barIdx >= 0, 'the project line must carry the context bar');
  assert.ok(modelIdx >= 0 && modelIdx < barIdx, 'the bar must come after the model badge');
  assert.ok(barIdx < valueIdx, 'the value must follow the bar');
  assert.ok(valueIdx < projectIdx, 'the project segment must come last');
  assert.ok(!line.includes('Context'), 'the context label must be suppressed in this mode');
});

test('projectLine: the token-count suffix moves up with the bar', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  ctx.config.display.showContextTokens = true;
  const line = stripAnsi(renderProjectLine(ctx) ?? '');
  assert.match(line, /\(10k tk\)/);
});

test('projectLine: the usage-only progress line still renders', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  ctx.usageData = { fiveHour: 24, sevenDay: 39, fiveHourResetAt: null, sevenDayResetAt: null, balanceLabel: 'Ollama Pro' };
  const usage = stripAnsi(renderUsageLine(ctx) ?? '');
  assert.match(usage, /^Usage /);
  assert.ok(!usage.includes('Ctx'), 'the usage-only line must not start with the context part');
});

test('projectLine: context only (showContextBar=false) still hoists the value', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  ctx.config.display.showContextBar = false;
  const line = stripAnsi(renderProjectLine(ctx) ?? '');
  assert.ok(!line.includes('█'), 'showContextBar=false must suppress the bar');
  assert.match(line, /5%/);
});

test('projectLine: model badge suppressed still hoists the bar', () => {
  const ctx = baseContext();
  ctx.config.display.contextPosition = 'projectLine';
  ctx.config.display.showModel = false;
  const line = stripAnsi(renderProjectLine(ctx) ?? '');
  assert.ok(!line.includes('[Opus]'));
  assert.match(line, /█░* 5%/);
  assert.match(line, /my-project/);
});