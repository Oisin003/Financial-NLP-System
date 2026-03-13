/**
 * Ablation Study Runner (Audit Rules)
 *
 * What this script does:
 * 1. Runs a fixed set of realistic financial text cases.
 * 2. Re-runs the same cases across several rule variants (ablations).
 * 3. Compares each variant against expected labels using precision/recall/F1.
 * 4. Saves results as JSON + CSV in server/results/ablation.
 *
 * Usage:
 *   npm run ablation
 *
 * Notes:
 * - Safe by default: this script does not change production settings.
 * - It uses function-level toggles passed directly into analyzeAuditFlags.
 * - Keep the same test cases when comparing runs over time.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeAuditFlags } from '../services/nlpProcessor.js';

// Figure out where this script lives so output paths are stable.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, '..');
const RESULTS_DIR = path.join(SERVER_ROOT, 'results', 'ablation');

// All rule IDs we score as binary labels (present/absent per document).
// Keeping this list centralized ensures every variant is compared on the same target labels.
const TARGET_RULE_IDS = [
  'rag-status',
  'incomplete-data',
  'debt-burden',
  'gross-margin-deterioration',
  'going-concern-risk'
];

// Fixed ablation variants. Baseline keeps every rule enabled.
// Each variant toggles one behavior so we can estimate its contribution to overall quality.
const VARIANTS = [
  {
    id: 'baseline',
    description: 'All audit rules enabled (current system behavior).',
    options: {}
  },
  {
    id: 'no_debt_burden',
    description: 'Debt burden rule disabled.',
    options: { enableDebtBurdenRule: false }
  },
  {
    id: 'no_gross_margin',
    description: 'Gross margin deterioration rule disabled.',
    options: { enableGrossMarginRule: false }
  },
  {
    id: 'no_going_concern',
    description: 'Going-concern wording rule disabled.',
    options: { enableGoingConcernRule: false }
  },
  {
    id: 'no_rag',
    description: 'RAG status flag disabled.',
    options: { enableRagRule: false }
  },
  {
    id: 'no_extra_rules',
    description: 'Only RAG + incomplete-data remain enabled.',
    options: {
      enableDebtBurdenRule: false,
      enableGrossMarginRule: false,
      enableGoingConcernRule: false
    }
  }
];

// Small but diverse labeled set used by every variant.
// These cases are intentionally stable so historical runs are comparable.
const DATASET = [
  {
    id: 'healthy_green',
    text: [
      'Turnover 600000',
      'Profit before tax 90000',
      'Net assets 220000'
    ].join('\n'),
    expectedRuleIds: ['rag-status'],
    expectedRagStatus: 'green'
  },
  {
    id: 'turnover_red',
    text: [
      'Turnover 250000',
      'Profit before tax 45000',
      'Net assets 120000'
    ].join('\n'),
    expectedRuleIds: ['rag-status'],
    expectedRagStatus: 'red'
  },
  {
    id: 'debt_burden_amber',
    text: [
      'Turnover 500000',
      'Loans and borrowings 400000',
      'Profit before tax 30000',
      'Net assets 110000'
    ].join('\n'),
    expectedRuleIds: ['rag-status', 'debt-burden'],
    expectedRagStatus: 'green'
  },
  {
    id: 'gross_margin_red',
    text: [
      'Turnover 510000',
      'Profit before tax 31000',
      'Net assets 90000',
      'Gross margin (%) 45.0% 60.0%'
    ].join('\n'),
    expectedRuleIds: ['rag-status', 'gross-margin-deterioration'],
    expectedRagStatus: 'green'
  },
  {
    id: 'going_concern_high',
    text: [
      'Turnover 490000',
      'Profit before tax 19000',
      'Net assets 70000',
      'There is a material uncertainty which may cast significant doubt on going concern.'
    ].join('\n'),
    expectedRuleIds: ['rag-status', 'going-concern-risk'],
    expectedRagStatus: 'green'
  },
  {
    id: 'incomplete_data',
    text: [
      'Profit before tax 20000',
      'Net assets 50000'
    ].join('\n'),
    expectedRuleIds: ['incomplete-data']
  }
];

function ensureResultsDir() {
  // Create output folder if needed. "recursive: true" means no error if it already exists.
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

function round(value, places = 4) {
  // Keep numbers consistent in console/CSV output.
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

function calculatePrf1(tp, fp, fn) {
  // Precision: of predicted positives, how many are correct?
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  // Recall: of expected positives, how many did we find?
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  // F1: balances precision and recall.
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  return {
    precision: round(precision),
    recall: round(recall),
    f1: round(f1)
  };
}

function scoreRulePresence(predictedRuleIds, expectedRuleIds) {
  // Count outcomes over the fixed target-rule space (not just rules that were predicted).
  let tp = 0;
  let fp = 0;
  let fn = 0;

  for (const ruleId of TARGET_RULE_IDS) {
    const predicted = predictedRuleIds.has(ruleId);
    const expected = expectedRuleIds.has(ruleId);

    if (predicted && expected) tp += 1;
    if (predicted && !expected) fp += 1;
    if (!predicted && expected) fn += 1;
  }

  return { tp, fp, fn };
}

function runVariant(variant) {
  // Measure how long this variant takes to run.
  const startedAt = Date.now();

  // Totals are accumulated across all documents, then converted to PR/F1 once per variant.
  let tpTotal = 0;
  let fpTotal = 0;
  let fnTotal = 0;

  // RAG status quality is tracked independently because it is not a simple rule presence signal.
  let ragCases = 0;
  let ragCorrect = 0;

  const caseRows = [];

  for (const example of DATASET) {
    // Run the same input text with this variant's options.
    const flags = analyzeAuditFlags(example.text, variant.options);
    const predictedRuleIds = new Set(flags.map((flag) => flag.id));
    const expectedRuleIds = new Set(example.expectedRuleIds);

    const { tp, fp, fn } = scoreRulePresence(predictedRuleIds, expectedRuleIds);
    // Aggregate confusion counts so we can compute one macro view per variant.
    tpTotal += tp;
    fpTotal += fp;
    fnTotal += fn;

    // RAG accuracy is tracked separately from rule-level precision/recall/F1.
    const ragFlag = flags.find((flag) => flag.id === 'rag-status');
    const predictedRag = ragFlag?.evidence?.ragStatus || null;

    if (example.expectedRagStatus) {
      ragCases += 1;
      if (predictedRag === example.expectedRagStatus) {
        ragCorrect += 1;
      }
    }

    caseRows.push({
      // Save per-case outputs so markdown can explain exactly where differences happened.
      caseId: example.id,
      expectedRuleIds: [...expectedRuleIds],
      predictedRuleIds: [...predictedRuleIds],
      expectedRagStatus: example.expectedRagStatus || null,
      predictedRagStatus: predictedRag
    });
  }

  const metrics = calculatePrf1(tpTotal, fpTotal, fnTotal);
  const ragAccuracy = ragCases > 0 ? round(ragCorrect / ragCases) : null;
  const durationMs = Date.now() - startedAt;

  return {
    id: variant.id,
    description: variant.description,
    options: variant.options,
    metrics: {
      ...metrics,
      ragAccuracy,
      tp: tpTotal,
      fp: fpTotal,
      fn: fnTotal,
      durationMs
    },
    cases: caseRows
  };
}

function buildCsv(results) {
  // Header row for spreadsheet-friendly output.
  const header = [
    'variant',
    'precision',
    'recall',
    'f1',
    'rag_accuracy',
    'tp',
    'fp',
    'fn',
    'duration_ms',
    'description'
  ].join(',');

  // Build data rows with a simple loop for readability.
  const rows = [];
  for (const result of results) {
    const m = result.metrics;
    const row = [
      result.id,
      m.precision,
      m.recall,
      m.f1,
      m.ragAccuracy === null ? '' : m.ragAccuracy,
      m.tp,
      m.fp,
      m.fn,
      m.durationMs,
      `"${result.description.replace(/"/g, '""')}"`
    ].join(',');

    rows.push(row);
  }

  return [header, ...rows].join('\n');
}

function getRuleToggleSummary(options) {
  // Human-readable summary used in markdown sections.
  const entries = Object.entries(options || {});
  if (entries.length === 0) {
    return 'Default behavior (all rules enabled).';
  }

  const parts = [];
  for (const [key, value] of entries) {
    parts.push(`${key}=${value}`);
  }

  return parts.join(', ');
}

function buildDetailedMarkdownReport(results, createdAtIso) {
  // Baseline is used as the reference point for all delta metrics.
  const baseline = results.find((result) => result.id === 'baseline') || results[0];
  const lines = [];

  lines.push('# Ablation Study Detailed Report');
  lines.push('');
  lines.push(`Generated: ${createdAtIso}`);
  lines.push(`Dataset size: ${DATASET.length}`);
  lines.push(`Variants tested: ${results.length}`);
  lines.push('');
  lines.push('## What This Study Is Doing');
  lines.push('');
  lines.push('This study evaluates audit-rule contribution by disabling one rule (or rule group) at a time and comparing output to labeled expectations.');
  lines.push('');
  lines.push('For each variant, it computes:');
  lines.push('- Precision: predicted flags that were correct.');
  lines.push('- Recall: expected flags that were found.');
  lines.push('- F1: balanced score between precision and recall.');
  lines.push('- RAG accuracy: correctness of red/amber/green classification only.');
  lines.push('');
  lines.push('## Dataset Cases');
  lines.push('');
  for (const sample of DATASET) {
    const expectedRagText = sample.expectedRagStatus ? `, expected RAG=${sample.expectedRagStatus}` : '';
    lines.push(`- ${sample.id}: expected rules=[${sample.expectedRuleIds.join(', ')}]${expectedRagText}`);
  }
  lines.push('');
  lines.push('## Variant Summary');
  lines.push('');
  lines.push('| Variant | Precision | Recall | F1 | RAG Accuracy | TP | FP | FN | Time (ms) | Delta F1 vs Baseline |');
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |');

  for (const result of results) {
    const m = result.metrics;
    const deltaF1 = m.f1 - baseline.metrics.f1;
    const ragText = m.ragAccuracy === null ? 'n/a' : m.ragAccuracy.toFixed(4);
    lines.push(`| ${result.id} | ${m.precision.toFixed(4)} | ${m.recall.toFixed(4)} | ${m.f1.toFixed(4)} | ${ragText} | ${m.tp} | ${m.fp} | ${m.fn} | ${m.durationMs} | ${deltaF1.toFixed(4)} |`);
  }


  // Build a focused ranking for single-rule ablations only.
  // This avoids mixing in multi-rule variants (like no_extra_rules) when estimating
  // the individual contribution of each rule.
  const singleRuleAblations = [];
  for (const result of results) {
    if (result.id === baseline.id) {
      continue;
    }

    const disabledRuleKeys = [];
    // We only consider explicit disabled toggles in this ranking.
    for (const [key, value] of Object.entries(result.options || {})) {
      if (value === false && key.startsWith('enable')) {
        disabledRuleKeys.push(key);
      }
    }

    if (disabledRuleKeys.length === 1) {
      const disabledKey = disabledRuleKeys[0];
      singleRuleAblations.push({
        result,
        disabledKey,
        deltaRecall: result.metrics.recall - baseline.metrics.recall,
        deltaF1: result.metrics.f1 - baseline.metrics.f1,
        deltaRagAccuracy:
          (result.metrics.ragAccuracy ?? 0) - (baseline.metrics.ragAccuracy ?? 0)
      });
    }
  }

  singleRuleAblations.sort((a, b) => a.deltaF1 - b.deltaF1);
  // More negative deltaF1 appears first (larger quality drop => higher importance).

  lines.push('## Rule Importance Ranking (Single-Rule Ablations)');
  lines.push('');

  if (singleRuleAblations.length === 0) {
    lines.push('- No single-rule ablation variants were found, so ranking was skipped.');
    lines.push('');
  } else {
    lines.push('Higher importance means disabling that single rule caused a larger performance drop versus baseline.');
    lines.push('');
    lines.push('| Rank | Disabled Rule Toggle | Variant | Delta Recall | Delta F1 | Delta RAG Accuracy |');
    lines.push('| ---: | --- | --- | ---: | ---: | ---: |');

    for (let i = 0; i < singleRuleAblations.length; i++) {
      const item = singleRuleAblations[i];
      lines.push(
        `| ${i + 1} | ${item.disabledKey} | ${item.result.id} | ${item.deltaRecall.toFixed(4)} | ${item.deltaF1.toFixed(4)} | ${item.deltaRagAccuracy.toFixed(4)} |`
      );
    }

    lines.push('');
    lines.push('Quick interpretation:');
    for (let i = 0; i < singleRuleAblations.length; i++) {
      const item = singleRuleAblations[i];
      const impactLabel = i === 0 ? 'highest impact' : i === singleRuleAblations.length - 1 ? 'lowest impact' : 'medium impact';
      lines.push(
        `- ${item.result.id}: ${impactLabel} (delta F1 ${item.deltaF1.toFixed(4)}, delta recall ${item.deltaRecall.toFixed(4)}).`
      );
    }
    lines.push('');
  }
  lines.push('');
  lines.push('## Detailed Variant Findings');
  lines.push('');

  for (const result of results) {
    const m = result.metrics;
    const deltaRecall = m.recall - baseline.metrics.recall;
    const deltaF1 = m.f1 - baseline.metrics.f1;
    lines.push(`### ${result.id}`);
    lines.push('');
    lines.push(`- Description: ${result.description}`);
    lines.push(`- Rule toggles: ${getRuleToggleSummary(result.options)}`);
    lines.push(`- Returned metrics: precision=${m.precision.toFixed(4)}, recall=${m.recall.toFixed(4)}, f1=${m.f1.toFixed(4)}, ragAccuracy=${m.ragAccuracy === null ? 'n/a' : m.ragAccuracy.toFixed(4)}, tp=${m.tp}, fp=${m.fp}, fn=${m.fn}, durationMs=${m.durationMs}`);
    lines.push(`- Delta vs baseline: recall=${deltaRecall.toFixed(4)}, f1=${deltaF1.toFixed(4)}`);
    lines.push('');
    lines.push('Case-level differences:');

    let mismatchCount = 0;
    for (const row of result.cases) {
      // Compare expected and predicted rule IDs explicitly for readable diagnostics.
      const expectedSet = new Set(row.expectedRuleIds);
      const predictedSet = new Set(row.predictedRuleIds);

      const missingRules = [];
      const unexpectedRules = [];

      for (const expectedRule of expectedSet) {
        if (!predictedSet.has(expectedRule)) {
          missingRules.push(expectedRule);
        }
      }

      for (const predictedRule of predictedSet) {
        if (!expectedSet.has(predictedRule)) {
          unexpectedRules.push(predictedRule);
        }
      }

      const ragMismatch = row.expectedRagStatus && row.expectedRagStatus !== row.predictedRagStatus;

      if (missingRules.length > 0 || unexpectedRules.length > 0 || ragMismatch) {
        mismatchCount += 1;
        const ragInfo = row.expectedRagStatus
          ? ` | RAG expected=${row.expectedRagStatus}, predicted=${row.predictedRagStatus ?? 'null'}`
          : '';
        lines.push(`- ${row.caseId}: missing=[${missingRules.join(', ')}], unexpected=[${unexpectedRules.join(', ')}]${ragInfo}`);
      }
    }

    if (mismatchCount === 0) {
      lines.push('- No mismatches against labeled expectations.');
    }

    lines.push('');
  }

  lines.push('## Interpretation Notes');
  lines.push('');
  lines.push('- Variants with lower recall/F1 than baseline indicate removed rules were contributing signal.');
  lines.push('- If precision remains high while recall drops, the model became more conservative (fewer detections).');
  lines.push('- This is a controlled audit-rule ablation only; it does not yet evaluate summarization or NER components.');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function printSummaryTable(results) {
  // Console table is intentionally compact for quick CLI review.
  console.log('\nAblation Summary (Audit Rules)');
  console.log('='.repeat(88));
  console.log('Variant'.padEnd(22), 'P'.padEnd(8), 'R'.padEnd(8), 'F1'.padEnd(8), 'RAG Acc'.padEnd(10), 'ms'.padEnd(8));
  console.log('-'.repeat(88));

  for (const result of results) {
    const m = result.metrics;
    const ragAcc = m.ragAccuracy === null ? 'n/a' : m.ragAccuracy.toFixed(4);
    console.log(
      result.id.padEnd(22),
      m.precision.toFixed(4).padEnd(8),
      m.recall.toFixed(4).padEnd(8),
      m.f1.toFixed(4).padEnd(8),
      ragAcc.padEnd(10),
      String(m.durationMs).padEnd(8)
    );
  }

  console.log('='.repeat(88));
}

function main() {
  // Step 1: make sure output directory exists.
  ensureResultsDir();

  console.log('Running ablation study using a fixed audit dataset...');
  console.log(`Cases: ${DATASET.length}`);
  console.log(`Variants: ${VARIANTS.length}`);

  // Step 2: run each variant and collect its metrics.
  const results = [];
  for (const variant of VARIANTS) {
    results.push(runVariant(variant));
  }

  // Step 3: print terminal summary for quick review.
  printSummaryTable(results);

  const createdAt = new Date().toISOString();
  const timestamp = createdAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(RESULTS_DIR, `ablation-${timestamp}.json`);
  const csvPath = path.join(RESULTS_DIR, `ablation-${timestamp}.csv`);
  const markdownPath = path.join(RESULTS_DIR, `ablation-${timestamp}.md`);
  const latestJsonPath = path.join(RESULTS_DIR, 'latest.json');
  const latestCsvPath = path.join(RESULTS_DIR, 'latest.csv');
  const latestMarkdownPath = path.join(RESULTS_DIR, 'latest.md');

  // Step 4: build detailed JSON payload.
  const payload = {
    // Include dataset metadata so downstream analysis knows exactly what was scored.
    createdAt,
    datasetSize: DATASET.length,
    targetRuleIds: TARGET_RULE_IDS,
    variants: results
  };

  const detailedMarkdown = buildDetailedMarkdownReport(results, createdAt);

  // Step 5: save timestamped reports.
  fs.writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(csvPath, `${buildCsv(results)}\n`, 'utf8');
  fs.writeFileSync(markdownPath, detailedMarkdown, 'utf8');

  // Step 6: save convenience files with fixed names for easy access.
  fs.writeFileSync(latestJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  fs.writeFileSync(latestCsvPath, `${buildCsv(results)}\n`, 'utf8');
  fs.writeFileSync(latestMarkdownPath, detailedMarkdown, 'utf8');

  console.log('\nSaved reports:');
  console.log(`- ${jsonPath}`);
  console.log(`- ${csvPath}`);
  console.log(`- ${markdownPath}`);
  console.log(`- ${latestJsonPath}`);
  console.log(`- ${latestCsvPath}`);
  console.log(`- ${latestMarkdownPath}`);
}

main();
