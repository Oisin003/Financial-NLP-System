/**
 * Audit Flag Detection Tests
 *
 * Simple unit tests for the audit flag rules.
 */

import { analyzeAuditFlags } from '../services/nlpProcessor.js';

describe('Audit flag detection', () => {
  test('Detects high overhead ratio', () => {
    const text = [
      'Total Revenue 100000',
      'Operating Expenses 45000'
    ].join('\n');

    const flags = analyzeAuditFlags(text);
    const ids = flags.map(flag => flag.id);

    expect(ids).toContain('high-overhead');
  });

  test('Detects negative operating cash flow', () => {
    const text = 'Net cash provided by operating activities ($12,500)';

    const flags = analyzeAuditFlags(text);
    const ids = flags.map(flag => flag.id);

    expect(ids).toContain('negative-operating-cashflow');
  });

  test('Detects falling gross margin', () => {
    const text = [
      'Gross margin 42%',
      'Gross margin 38%'
    ].join('\n');

    const flags = analyzeAuditFlags(text);
    const ids = flags.map(flag => flag.id);

    expect(ids).toContain('gross-margin-down');
  });

  test('Detects low current ratio', () => {
    const text = 'Current ratio 1.2';

    const flags = analyzeAuditFlags(text);
    const ids = flags.map(flag => flag.id);

    expect(ids).toContain('liquidity-risk');
  });

  test('Detects high debt to equity', () => {
    const text = 'Debt-to-equity 2.8';

    const flags = analyzeAuditFlags(text);
    const ids = flags.map(flag => flag.id);

    expect(ids).toContain('leverage-risk');
  });
});
