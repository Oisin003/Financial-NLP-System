/**
 * RAG Audit Flag Detection Tests
 *
 * Unit tests for the RAG (Red/Amber/Green) audit flagging system.
 * 
 * RAG Rules:
 * R (Red)   = turnover < 350k OR [net liabilities AND negative profit before tax]
 * A (Amber) = negative profit before tax OR negative net assets (net liabilities)
 * G (Green) = turnover > 350k AND positive profit before tax AND positive net assets
 * 
 * Provided by Robbie
 */

import { analyzeAuditFlags } from '../services/nlpProcessor.js';

describe('RAG Audit Flag Detection', () => {

  describe('RED Status', () => {
    test('Flags RED when turnover is below 350k', () => {
      const text = [
        'Turnover 250000',
        'Profit before tax 50000',
        'Net assets 100000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('red');
      expect(ragFlag.severity).toBe('high');
    });

    test('Flags RED when net liabilities AND negative profit before tax', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax (25000)',
        'Net assets (50000)'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('red');
      expect(ragFlag.evidence.profitBeforeTax).toBeLessThan(0);
      expect(ragFlag.evidence.netAssets).toBeLessThan(0);
    });
  });

  describe('AMBER Status', () => {
    test('Flags AMBER when profit before tax is negative (but has assets)', () => {
      const text = [
        'Turnover 500000',
        'Loss before tax 15000',
        'Net assets 100000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('amber');
      expect(ragFlag.evidence.profitBeforeTax).toBeLessThan(0);
    });

    test('Flags AMBER when net assets are negative (net liabilities) but profitable', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 50000',
        'Net liabilities (30000)'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('amber');
      expect(ragFlag.evidence.netAssets).toBeLessThan(0);
    });
  });

  describe('GREEN Status', () => {
    test('Flags GREEN when turnover > 350k AND positive profit AND positive net assets', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 75000',
        'Net assets 200000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('green');
      expect(ragFlag.severity).toBe('low');
    });

    test('Flags GREEN when turnover exactly 350k with positive metrics', () => {
      const text = [
        'Turnover 350000',
        'Profit before tax 25000',
        'Net assets 80000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag).toBeDefined();
      expect(ragFlag.evidence.ragStatus).toBe('green');
    });
  });

  describe('Incomplete Data', () => {
    test('Flags incomplete data when turnover is missing', () => {
      const text = [
        'Profit before tax 50000',
        'Net assets 100000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const incompleteFlag = flags.find(f => f.id === 'incomplete-data');

      expect(incompleteFlag).toBeDefined();
      expect(incompleteFlag.evidence.missingMetrics).toContain('turnover');
    });

    test('Returns empty flags for empty text', () => {
      const flags = analyzeAuditFlags('');
      expect(flags).toEqual([]);
    });
  });

  describe('Number Parsing', () => {
    test('Parses negative values in parentheses', () => {
      const text = [
        'Turnover 400000',
        'Profit before tax (10000)',
        'Net assets 50000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag.evidence.profitBeforeTax).toBe(-10000);
      expect(ragFlag.evidence.ragStatus).toBe('amber');
    });

    test('Parses values with currency symbols and commas', () => {
      const text = [
        'Turnover £1,500,000',
        'Profit before tax £250,000',
        'Net assets £500,000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const ragFlag = flags.find(f => f.id === 'rag-status');

      expect(ragFlag.evidence.turnover).toBe(1500000);
      expect(ragFlag.evidence.ragStatus).toBe('green');
    });
  });

  describe('Debt Burden Rule', () => {
    test('Flags AMBER when borrowings are high relative to turnover', () => {
      const text = [
        'Turnover 500000',
        'Loans and borrowings 400000',
        'Profit before tax 25000',
        'Net assets 150000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const debtFlag = flags.find(f => f.id === 'debt-burden');

      expect(debtFlag).toBeDefined();
      expect(debtFlag.severity).toBe('medium');
      expect(debtFlag.evidence.debtToTurnoverRatio).toBeGreaterThanOrEqual(0.7);
    });

    test('Flags RED when borrowings exceed turnover', () => {
      const text = [
        'Turnover 600000',
        'Loans and borrowings 750000',
        'Profit before tax 30000',
        'Net assets 120000'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const debtFlag = flags.find(f => f.id === 'debt-burden');

      expect(debtFlag).toBeDefined();
      expect(debtFlag.severity).toBe('high');
      expect(debtFlag.evidence.debtToTurnoverRatio).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Gross Margin Deterioration Rule', () => {
    test('Flags AMBER when gross margin drops by >= 5 percentage points', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 50000',
        'Net assets 100000',
        'Gross margin (%) 52.0% 58.0%'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const marginFlag = flags.find(f => f.id === 'gross-margin-deterioration');

      expect(marginFlag).toBeDefined();
      expect(marginFlag.severity).toBe('medium');
      expect(marginFlag.evidence.marginChangePctPoints).toBeLessThanOrEqual(-5);
    });

    test('Flags RED when gross margin drops by >= 10 percentage points', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 50000',
        'Net assets 100000',
        'Gross margin (%) 45.0% 60.0%'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const marginFlag = flags.find(f => f.id === 'gross-margin-deterioration');

      expect(marginFlag).toBeDefined();
      expect(marginFlag.severity).toBe('high');
      expect(marginFlag.evidence.marginChangePctPoints).toBeLessThanOrEqual(-10);
    });
  });

  describe('Going Concern Wording Rule', () => {
    test('Flags AMBER for going concern with dependency wording', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 20000',
        'Net assets 100000',
        'The financial statements have been prepared on a going concern basis.',
        'The overdraft facility is repayable on demand and dependent upon continuing support.'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const gcFlag = flags.find(f => f.id === 'going-concern-risk');

      expect(gcFlag).toBeDefined();
      expect(gcFlag.severity).toBe('medium');
    });

    test('Flags RED for severe going concern warning wording', () => {
      const text = [
        'Turnover 500000',
        'Profit before tax 20000',
        'Net assets 100000',
        'There is a material uncertainty which may cast significant doubt on going concern.'
      ].join('\n');

      const flags = analyzeAuditFlags(text);
      const gcFlag = flags.find(f => f.id === 'going-concern-risk');

      expect(gcFlag).toBeDefined();
      expect(gcFlag.severity).toBe('high');
    });
  });
});
