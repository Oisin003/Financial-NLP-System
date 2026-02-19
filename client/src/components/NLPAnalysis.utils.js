// Utilities used by NLP analysis view components.
// Functions in this file keep rendering files focused on UI concerns.

// Builds high-level document statistics with safe defaults.
export function buildStats(nlpData) {
  return {
    textLength: (nlpData?.extractedText && nlpData.extractedText.length) || 0,
    totalWords: (nlpData?.processedTokens && nlpData.processedTokens.length) || 0,
    uniqueWords: Object.keys(nlpData?.wordFrequency || {}).length
  };
}

// Normalizes summary text to an empty string when unavailable.
export function getSummaryText(nlpData) {
  return typeof nlpData?.summary === 'string' ? nlpData.summary.trim() : '';
}

// Deduplicates and caps financial figures to keep the panel readable.
export function getFinancialFigures(nlpData, limit = 25) {
  const financialFiguresRaw = Array.isArray(nlpData?.financial_figures) ? nlpData.financial_figures : [];

  return Array.from(
    new Map(
      financialFiguresRaw
        .filter(fig => fig && typeof fig.text === 'string' && fig.text.trim().length > 0)
        .map(fig => [fig.text.replace(/\s+/g, ' ').trim(), fig])
    ).values()
  ).slice(0, limit);
}

// Splits audit flags into RAG + grouped categories.
// Grouping logic is centralized so UI sections and tests share one behavior.
export function groupAuditFlags(auditFlags) {
  const ragFlag = auditFlags.find(flag => flag.id === 'rag-status');
  const nonRagFlags = auditFlags.filter(flag => flag.id !== 'rag-status');

  const financialRuleIds = new Set(['debt-burden', 'gross-margin-deterioration', 'incomplete-data']);
  const financialRiskFlags = nonRagFlags.filter(flag => financialRuleIds.has(flag.id));
  const narrativeRiskFlags = nonRagFlags.filter(flag => !financialRuleIds.has(flag.id));

  return {
    ragFlag,
    nonRagFlags,
    financialRiskFlags,
    narrativeRiskFlags
  };
}

// Converts audit evidence objects into user-facing bullet items.
// Order is intentional: quantitative indicators appear before source-line context.
export function formatAuditEvidenceItems(flag) {
  const evidence = flag && flag.evidence ? flag.evidence : null;
  if (!evidence) return [];

  const items = [];

  if (typeof evidence.debtToTurnoverRatio === 'number') {
    items.push(`Debt/Turnover: ${(evidence.debtToTurnoverRatio * 100).toFixed(1)}%`);
  }
  if (typeof evidence.marginChangePctPoints === 'number') {
    items.push(`Margin change: ${evidence.marginChangePctPoints.toFixed(2)}pp`);
  }
  if (typeof evidence.latestMargin === 'number' && typeof evidence.priorMargin === 'number') {
    items.push(`Latest/Prior margin: ${evidence.latestMargin.toFixed(2)}% / ${evidence.priorMargin.toFixed(2)}%`);
  }
  if (evidence.matchedPhrase) {
    items.push(`Matched phrase: "${evidence.matchedPhrase}"`);
  }
  if (Array.isArray(evidence.missingMetrics) && evidence.missingMetrics.length > 0) {
    items.push(`Missing metrics: ${evidence.missingMetrics.join(', ')}`);
  }
  if (evidence.borrowingsLine) {
    items.push(`Borrowings line: ${evidence.borrowingsLine}`);
  }
  if (evidence.turnoverLine) {
    items.push(`Turnover line: ${evidence.turnoverLine}`);
  }
  if (evidence.profitBeforeTaxLine) {
    items.push(`PBT line: ${evidence.profitBeforeTaxLine}`);
  }
  if (evidence.netAssetsLine) {
    items.push(`Net assets line: ${evidence.netAssetsLine}`);
  }
  if (evidence.line) {
    items.push(`Evidence: ${evidence.line}`);
  }

  return items;
}

// Centralized severity color mapping used by audit flag cards.
// Shared mapping avoids diverging visual severity semantics between components.
export function getSeverityColors(severity) {
  const severityColors = {
    high: { border: '#dc3545', bg: '#fff5f5' },
    medium: { border: '#ffc107', bg: '#fffbeb' },
    low: { border: '#28a745', bg: '#f0fff4' }
  };

  return severityColors[severity] || severityColors.medium;
}
