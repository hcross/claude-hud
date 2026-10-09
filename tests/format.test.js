import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatTokens, formatTokensCompact } from '../dist/utils/format.js';

test('formatTokens rounds under a million and uses M above', () => {
  assert.equal(formatTokens(800), '800');
  assert.equal(formatTokens(45_000), '45k');
  assert.equal(formatTokens(1_200_000), '1.2M');
});

test('formatTokensCompact keeps one decimal under a million, two above', () => {
  assert.equal(formatTokensCompact(800), '800');
  assert.equal(formatTokensCompact(92_200), '92.2k');
  assert.equal(formatTokensCompact(91_000), '91k');
  assert.equal(formatTokensCompact(1_230_000), '1.23m');
  assert.equal(formatTokensCompact(1_000_000), '1m');
  assert.equal(formatTokensCompact(0), '0');
});

test('formatTokens differs from formatTokensCompact on the same values', () => {
  assert.equal(formatTokens(92_200), '92k');
  assert.equal(formatTokens(1_230_000), '1.2M');
  assert.equal(formatTokensCompact(1_230_000), '1.23m');
});