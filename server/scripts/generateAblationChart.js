/**
 * Ablation Study Chart Generator
 *
 * Reads the latest ablation JSON result and writes a self-contained HTML file
 * with interactive bar charts showing:
 *   - Precision, Recall, F1, RAG Accuracy per variant
 *   - True Positive / False Positive / False Negative counts per variant
 *   - Run duration per variant
 *
 * Usage:
 *   npm run ablation:chart
 *   node scripts/generateAblationChart.js [path-to-ablation.json]
 *
 * Output:
 *   server/results/ablation/latest-chart.html
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RESULTS_DIR = path.resolve(__dirname, '..', 'results', 'ablation');

function loadJson(jsonPath) {
  if (!fs.existsSync(jsonPath)) {
    throw new Error(`File not found: ${jsonPath}`);
  }
  return JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
}

function buildHtml(data) {
  const variants = data.variants || [];

  // Pull out per-variant values in order.
  const labels     = variants.map((v) => v.id);
  const precision  = variants.map((v) => v.metrics.precision ?? 0);
  const recall     = variants.map((v) => v.metrics.recall ?? 0);
  const f1         = variants.map((v) => v.metrics.f1 ?? 0);
  const ragAcc     = variants.map((v) => v.metrics.ragAccuracy ?? 0);
  const tp         = variants.map((v) => v.metrics.tp ?? 0);
  const fp         = variants.map((v) => v.metrics.fp ?? 0);
  const fn         = variants.map((v) => v.metrics.fn ?? 0);
  const duration   = variants.map((v) => v.metrics.durationMs ?? 0);

  const createdAt  = data.createdAt ? new Date(data.createdAt).toLocaleString() : 'unknown';
  const datasetSize = data.datasetSize ?? '?';

  // Serialize to JS-safe JSON strings for inline use in the script block.
  const labelsJson    = JSON.stringify(labels);
  const precisionJson = JSON.stringify(precision);
  const recallJson    = JSON.stringify(recall);
  const f1Json        = JSON.stringify(f1);
  const ragAccJson    = JSON.stringify(ragAcc);
  const tpJson        = JSON.stringify(tp);
  const fpJson        = JSON.stringify(fp);
  const fnJson        = JSON.stringify(fn);
  const durationJson  = JSON.stringify(duration);

  // Build a summary table row for each variant.
  const tableRows = variants.map((v) => {
    const m = v.metrics;
    const pct = (n) => (n * 100).toFixed(1) + '%';
    const ragCell = m.ragAccuracy !== null ? pct(m.ragAccuracy) : '—';
    return `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td>${pct(m.precision)}</td>
        <td>${pct(m.recall)}</td>
        <td>${pct(m.f1)}</td>
        <td>${ragCell}</td>
        <td>${m.tp}</td>
        <td>${m.fp}</td>
        <td>${m.fn}</td>
        <td>${m.durationMs} ms</td>
        <td class="desc">${v.description}</td>
      </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Ablation Study Results</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      margin: 0; padding: 24px;
      background: #f4f6f9;
      color: #1a1a2e;
    }
    h1 { font-size: 1.6rem; margin-bottom: 4px; }
    .meta { color: #555; font-size: 0.875rem; margin-bottom: 28px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 20px 20px 14px;
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
    }
    .card h2 { font-size: 1rem; margin: 0 0 14px; color: #333; }
    .card canvas { max-height: 260px; }
    table {
      width: 100%; border-collapse: collapse;
      background: #fff; border-radius: 10px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,.1);
      font-size: 0.85rem;
    }
    th {
      background: #1a1a2e; color: #fff;
      padding: 10px 12px; text-align: left; font-weight: 600;
    }
    td { padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr:nth-child(even) td { background: #fafafa; }
    .desc { color: #555; font-size: 0.8rem; max-width: 240px; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin: 8px 0 14px; }
    .about {
      background: #fff;
      border-radius: 10px;
      padding: 20px 24px;
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
      margin-bottom: 28px;
      max-width: 900px;
    }
    .about h2 { font-size: 1.05rem; margin: 0 0 10px; color: #1a1a2e; }
    .about p  { margin: 0 0 10px; line-height: 1.6; font-size: 0.9rem; color: #333; }
    .about p:last-child { margin-bottom: 0; }
    .about ul { margin: 4px 0 10px 20px; padding: 0; font-size: 0.9rem; color: #333; line-height: 1.7; }
    .card-caption { font-size: 0.78rem; color: #666; margin: 8px 4px 0; line-height: 1.5; }
  </style>
</head>
<body>
  <h1>Ablation Study Results</h1>
  <p class="meta">
    Generated: ${createdAt} &nbsp;|&nbsp;
    Dataset size: ${datasetSize} cases &nbsp;|&nbsp;
    Variants: ${variants.length}
  </p>

  <div class="about">
    <h2>What is an Ablation Study?</h2>
    <p>
      An ablation study measures how much each individual part of a system contributes to its overall
      performance. The word &ldquo;ablation&rdquo; comes from science — it means removing a component to
      see what stops working without it. Here, each <strong>variant</strong> is a version of the audit
      rule engine with exactly one rule (or rule group) switched off. By comparing every variant back
      to the <strong>baseline</strong> (all rules on), we can see which rules matter most.
    </p>
    <h2>What Are the Variants?</h2>
    <p>
      Each variant appears as a column in the charts and a row in the table below:
    </p>
    <ul>
      <li><strong>baseline</strong> — all audit rules enabled. This is the reference point every other variant is compared against.</li>
      <li><strong>no_debt_burden</strong> — the debt-burden rule is disabled. Checks whether loans and borrowings are too high relative to turnover.</li>
      <li><strong>no_gross_margin</strong> — the gross margin deterioration rule is disabled. Detects when margin is shrinking year-on-year.</li>
      <li><strong>no_going_concern</strong> — the going-concern wording rule is disabled. Flags high-risk phrases such as &ldquo;material uncertainty&rdquo;.</li>
      <li><strong>no_rag</strong> — the RAG status rule is disabled. RAG classifies overall financial health as Red, Amber, or Green.</li>
      <li><strong>no_extra_rules</strong> — debt burden, gross margin, and going-concern are all disabled, leaving only RAG and incomplete-data.</li>
    </ul>
    <h2>How to Read the Metrics</h2>
    <ul>
      <li><strong>Precision</strong> — of all the flags the system raised, how many were actually expected? High precision means few false alarms.</li>
      <li><strong>Recall</strong> — of all the flags that should have been raised, how many did the system catch? High recall means few missed issues.</li>
      <li><strong>F1 Score</strong> — the harmonic mean of precision and recall. A single balanced score: 100% is perfect, 0% is useless.</li>
      <li><strong>RAG Accuracy</strong> — specifically measures how often the Red / Amber / Green classification matched the expected label. Scored separately because it is not a simple rule-present/absent signal.</li>
      <li><strong>TP (True Positives)</strong> — flags the system raised that were correct.</li>
      <li><strong>FP (False Positives)</strong> — flags the system raised that were not expected (false alarms).</li>
      <li><strong>FN (False Negatives)</strong> — flags that should have been raised but were missed.</li>
    </ul>
    <p>
      A drop in Recall or F1 compared to the baseline tells you that the disabled rule was contributing
      real signal. If disabling a rule makes no difference, that rule may be redundant or the test
      dataset may not exercise it.
    </p>
  </div>

  <div class="grid">

    <!-- Chart 1: Precision / Recall / F1 -->
    <div class="card">
      <h2>Precision / Recall / F1 by Variant</h2>
      <canvas id="prf1Chart"></canvas>
      <p class="card-caption">Bars close to 100% on all three metrics indicate the variant is performing well. A drop vs the baseline reveals which rule was contributing signal. F1 balances precision and recall into one number.</p>
    </div>

    <!-- Chart 2: RAG Accuracy -->
    <div class="card">
      <h2>RAG Status Accuracy by Variant</h2>
      <canvas id="ragChart"></canvas>
      <p class="card-caption">Shows how accurately each variant classifies a document as Red, Amber, or Green. Blue = baseline. A grey bar shorter than the baseline means that variant misclassified at least one document&rsquo;s overall risk level.</p>
    </div>

    <!-- Chart 3: TP / FP / FN counts -->
    <div class="card">
      <h2>Confusion Counts (TP / FP / FN) by Variant</h2>
      <canvas id="confusionChart"></canvas>
      <p class="card-caption">Raw detection counts across all test cases. Ideal: high TP (green), zero FP (red) and zero FN (orange). Rising FN means the variant started missing flags that should have been raised.</p>
    </div>

    <!-- Chart 4: Run Duration -->
    <div class="card">
      <h2>Run Duration (ms) by Variant</h2>
      <canvas id="durationChart"></canvas>
      <p class="card-caption">Time each variant took to process the full dataset. All variants run in-process so differences reflect rule complexity rather than I/O. Useful for spotting unexpectedly slow rule combinations.</p>
    </div>

  </div>

  <p class="section-title">Summary Table</p>
  <p style="font-size:0.85rem;color:#555;margin:-6px 0 14px;">Each row is one variant. Precision, Recall, F1, and RAG Accuracy are shown as percentages &mdash; higher is better. TP/FP/FN are raw counts. The Description column explains which rule was disabled.</p>
  <table>
    <thead>
      <tr>
        <th>Variant</th>
        <th>Precision</th>
        <th>Recall</th>
        <th>F1</th>
        <th>RAG Acc.</th>
        <th>TP</th>
        <th>FP</th>
        <th>FN</th>
        <th>Duration</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <script>
    const LABELS    = ${labelsJson};
    const PRECISION = ${precisionJson};
    const RECALL    = ${recallJson};
    const F1        = ${f1Json};
    const RAG_ACC   = ${ragAccJson};
    const TP        = ${tpJson};
    const FP        = ${fpJson};
    const FN        = ${fnJson};
    const DURATION  = ${durationJson};

    const BASELINE_IDX = LABELS.indexOf('baseline');

    // Common bar chart options.
    function barOptions(yMax, yLabel) {
      return {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label(ctx) {
                const raw = ctx.raw;
                const isRatio = yMax === 1;
                return ' ' + ctx.dataset.label + ': ' + (isRatio ? (raw * 100).toFixed(1) + '%' : raw);
              }
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: yMax,
            title: { display: true, text: yLabel }
          }
        }
      };
    }

    // Colour palette — distinguishable on most displays.
    const COLOURS = [
      'rgba(52, 152, 219, 0.8)',
      'rgba(46, 204, 113, 0.8)',
      'rgba(231, 76, 60, 0.8)',
      'rgba(243, 156, 18, 0.8)',
      'rgba(155, 89, 182, 0.8)',
      'rgba(26, 188, 156, 0.8)'
    ];

    // Chart 1 — Precision / Recall / F1
    new Chart(document.getElementById('prf1Chart'), {
      type: 'bar',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'Precision',
            data: PRECISION,
            backgroundColor: 'rgba(52, 152, 219, 0.8)',
            borderColor: 'rgba(52, 152, 219, 1)',
            borderWidth: 1
          },
          {
            label: 'Recall',
            data: RECALL,
            backgroundColor: 'rgba(46, 204, 113, 0.8)',
            borderColor: 'rgba(46, 204, 113, 1)',
            borderWidth: 1
          },
          {
            label: 'F1',
            data: F1,
            backgroundColor: 'rgba(243, 156, 18, 0.8)',
            borderColor: 'rgba(243, 156, 18, 1)',
            borderWidth: 1
          }
        ]
      },
      options: barOptions(1, 'Score (0–1)')
    });

    // Chart 2 — RAG Accuracy
    new Chart(document.getElementById('ragChart'), {
      type: 'bar',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'RAG Accuracy',
            data: RAG_ACC,
            backgroundColor: LABELS.map((_, i) =>
              BASELINE_IDX === i ? 'rgba(52, 152, 219, 0.9)' : 'rgba(149, 165, 166, 0.7)'
            ),
            borderColor: LABELS.map((_, i) =>
              BASELINE_IDX === i ? 'rgba(41, 128, 185, 1)' : 'rgba(127, 140, 141, 1)'
            ),
            borderWidth: 1
          }
        ]
      },
      options: barOptions(1, 'Accuracy (0–1)')
    });

    // Chart 3 — TP / FP / FN counts
    new Chart(document.getElementById('confusionChart'), {
      type: 'bar',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'True Positives',
            data: TP,
            backgroundColor: 'rgba(46, 204, 113, 0.8)',
            borderColor: 'rgba(39, 174, 96, 1)',
            borderWidth: 1
          },
          {
            label: 'False Positives',
            data: FP,
            backgroundColor: 'rgba(231, 76, 60, 0.8)',
            borderColor: 'rgba(192, 57, 43, 1)',
            borderWidth: 1
          },
          {
            label: 'False Negatives',
            data: FN,
            backgroundColor: 'rgba(243, 156, 18, 0.8)',
            borderColor: 'rgba(211, 84, 0, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            min: 0,
            title: { display: true, text: 'Count' }
          }
        }
      }
    });

    // Chart 4 — Duration
    new Chart(document.getElementById('durationChart'), {
      type: 'bar',
      data: {
        labels: LABELS,
        datasets: [
          {
            label: 'Duration (ms)',
            data: DURATION,
            backgroundColor: LABELS.map((_, i) => COLOURS[i % COLOURS.length]),
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            min: 0,
            title: { display: true, text: 'Milliseconds' }
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

function run() {
  const customPath = process.argv[2];
  const jsonPath   = customPath
    ? path.resolve(customPath)
    : path.join(RESULTS_DIR, 'latest.json');

  console.log(`Reading ablation data from: ${jsonPath}`);
  const data = loadJson(jsonPath);

  const outPath = path.join(RESULTS_DIR, 'latest-chart.html');
  const html = buildHtml(data);
  fs.writeFileSync(outPath, html, 'utf-8');

  console.log(`Chart written to: ${outPath}`);
  console.log('Opening in browser...');
  const cmd = process.platform === 'win32'
    ? `start "" "${outPath}"`
    : process.platform === 'darwin'
      ? `open "${outPath}"`
      : `xdg-open "${outPath}"`;
  exec(cmd);
}

run();
