/**
 * NLP Insights Dashboard Generator (D3)
 *
 * Generates a self-contained HTML dashboard with:
 * 1) ROUGE/BLEU results graph
 * 2) NER output example with highlighted entities
 * 3) Traffic-light anomaly output (RAG + severity breakdown)
 *
 * Usage:
 *   npm run nlp:insights                    -- loads the most recent processed document from the database
 *   npm run nlp:insights -- --doc 8         -- loads document with ID 8 from the database
 *   npm run nlp:insights -- path/to/file.json  -- loads from a JSON file
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { Sequelize, DataTypes } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.join(__dirname, '..');
const RESULTS_DIR = path.join(SERVER_ROOT, 'results', 'insights');

function normalizeWhitespace(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalizeWhitespace(text).toLowerCase();
  if (!normalized) {
    return [];
  }
  return normalized.match(/[a-z0-9£$€]+(?:[-'][a-z0-9]+)?/g) || [];
}

function ngrams(tokens, n) {
  if (tokens.length < n || n <= 0) {
    return [];
  }

  const grams = [];
  for (let i = 0; i <= tokens.length - n; i += 1) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
}

function toCountMap(items) {
  const map = new Map();
  for (const item of items) {
    map.set(item, (map.get(item) || 0) + 1);
  }
  return map;
}

function clippedOverlap(candidateCounts, referenceCounts) {
  let overlap = 0;
  for (const [gram, candidateCount] of candidateCounts.entries()) {
    const referenceCount = referenceCounts.get(gram) || 0;
    overlap += Math.min(candidateCount, referenceCount);
  }
  return overlap;
}

function safeDivide(num, den) {
  if (!den) {
    return 0;
  }
  return num / den;
}

function rougeN(candidateTokens, referenceTokens, n) {
  const candidateGrams = ngrams(candidateTokens, n);
  const referenceGrams = ngrams(referenceTokens, n);

  const candidateCounts = toCountMap(candidateGrams);
  const referenceCounts = toCountMap(referenceGrams);
  const overlap = clippedOverlap(candidateCounts, referenceCounts);

  const precision = safeDivide(overlap, candidateGrams.length);
  const recall = safeDivide(overlap, referenceGrams.length);
  const f1 = safeDivide(2 * precision * recall, precision + recall);

  return {
    precision,
    recall,
    f1
  };
}

function lcsLength(a, b) {
  if (!a.length || !b.length) {
    return 0;
  }

  const cols = b.length + 1;
  let prev = new Array(cols).fill(0);
  let curr = new Array(cols).fill(0);

  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      if (a[i - 1] === b[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    const tmp = prev;
    prev = curr;
    curr = tmp;
    curr.fill(0);
  }

  return prev[b.length];
}

function rougeL(candidateTokens, referenceTokens) {
  const lcs = lcsLength(candidateTokens, referenceTokens);
  const precision = safeDivide(lcs, candidateTokens.length);
  const recall = safeDivide(lcs, referenceTokens.length);
  const f1 = safeDivide(2 * precision * recall, precision + recall);
  return { precision, recall, f1 };
}

function bleuN(candidateTokens, referenceTokens, maxN) {
  if (!candidateTokens.length || !referenceTokens.length) {
    return 0;
  }

  const precisions = [];
  for (let n = 1; n <= maxN; n += 1) {
    const candidateGrams = ngrams(candidateTokens, n);
    const referenceGrams = ngrams(referenceTokens, n);

    if (!candidateGrams.length) {
      precisions.push(0);
      continue;
    }

    const candidateCounts = toCountMap(candidateGrams);
    const referenceCounts = toCountMap(referenceGrams);
    const overlap = clippedOverlap(candidateCounts, referenceCounts);
    precisions.push(safeDivide(overlap, candidateGrams.length));
  }

  const eps = 1e-12;
  const logMean = precisions
    .slice(0, maxN)
    .reduce((sum, value) => sum + Math.log(Math.max(value, eps)), 0) / maxN;

  const candLen = candidateTokens.length;
  const refLen = referenceTokens.length;
  const brevityPenalty = candLen > refLen ? 1 : Math.exp(1 - safeDivide(refLen, candLen));

  return brevityPenalty * Math.exp(logMean);
}

function scoreSummary(summaryEvaluation) {
  const candidateSummary = summaryEvaluation?.candidate_summary || '';
  const selectedSentences = Array.isArray(summaryEvaluation?.candidate_sentences)
    ? summaryEvaluation.candidate_sentences
    : [];

  const explicitReference = summaryEvaluation?.reference_template?.human_reference_summary || '';
  const referenceText = normalizeWhitespace(explicitReference) || normalizeWhitespace(selectedSentences.join(' '));

  const candidateTokens = tokenize(candidateSummary);
  const referenceTokens = tokenize(referenceText);

  const r1 = rougeN(candidateTokens, referenceTokens, 1);
  const r2 = rougeN(candidateTokens, referenceTokens, 2);
  const rl = rougeL(candidateTokens, referenceTokens);

  const b1 = bleuN(candidateTokens, referenceTokens, 1);
  const b2 = bleuN(candidateTokens, referenceTokens, 2);
  const b3 = bleuN(candidateTokens, referenceTokens, 3);
  const b4 = bleuN(candidateTokens, referenceTokens, 4);

  const percentage = (value) => Number((value * 100).toFixed(2));

  return {
    candidateSummary,
    referenceText,
    hasReference: Boolean(normalizeWhitespace(referenceText)),
    rouge: [
      { metric: 'ROUGE-1 F1', value: percentage(r1.f1) },
      { metric: 'ROUGE-2 F1', value: percentage(r2.f1) },
      { metric: 'ROUGE-L F1', value: percentage(rl.f1) }
    ],
    bleu: [
      { metric: 'BLEU-1', value: percentage(b1) },
      { metric: 'BLEU-2', value: percentage(b2) },
      { metric: 'BLEU-3', value: percentage(b3) },
      { metric: 'BLEU-4', value: percentage(b4) }
    ]
  };
}

function loadFromJsonFile(inputPath) {
  const absolutePath = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(SERVER_ROOT, inputPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Input JSON not found: ${absolutePath}`);
  }

  const raw = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(raw);
}

async function loadFromDatabase(docId) {
  const DB_PATH = path.join(SERVER_ROOT, 'database.sqlite');

  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`Database not found at: ${DB_PATH}`);
  }

  const sequelize = new Sequelize({ dialect: 'sqlite', storage: DB_PATH, logging: false });

  const Doc = sequelize.define('Document', {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    originalName: DataTypes.STRING,
    extractedText: DataTypes.TEXT,
    nlpEntities: DataTypes.TEXT,
    auditFlags: DataTypes.TEXT,
    nlpSummaryEvaluation: DataTypes.TEXT,
  }, { timestamps: true });

  await sequelize.sync();

  let row;
  if (docId) {
    row = await Doc.findOne({ where: { id: Number(docId) } });
    if (!row) {
      throw new Error(`No document found with ID ${docId}`);
    }
  } else {
    // Pick the most recently processed document that has entities
    const rows = await Doc.findAll({
      order: [['id', 'DESC']],
    });
    row = rows.find((r) => {
      const ents = JSON.parse(r.getDataValue('nlpEntities') || '[]');
      return ents.length > 0;
    });
    if (!row) {
      throw new Error('No processed documents with entity data found in the database.');
    }
  }

  await sequelize.close();

  const parse = (field, fallback) => {
    try { return JSON.parse(row.getDataValue(field) || JSON.stringify(fallback)); }
    catch { return fallback; }
  };

  return {
    originalName: row.getDataValue('originalName'),
    extractedText: row.getDataValue('extractedText') || '',
    entities: parse('nlpEntities', []),
    auditFlags: parse('auditFlags', []),
    summary_evaluation: parse('nlpSummaryEvaluation', null),
  };
}

function getRagStatus(auditFlags) {
  const ragFlag = (auditFlags || []).find((flag) => flag?.id === 'rag-status');
  const status = ragFlag?.evidence?.ragStatus || 'unknown';
  return String(status).toLowerCase();
}

function severityCounts(auditFlags) {
  const counts = { high: 0, medium: 0, low: 0, other: 0 };
  for (const flag of auditFlags || []) {
    const key = String(flag?.severity || '').toLowerCase();
    if (key === 'high' || key === 'medium' || key === 'low') {
      counts[key] += 1;
    } else {
      counts.other += 1;
    }
  }
  return counts;
}

function buildEntitySample(text, entities, limitChars = 2000) {
  const safeText = String(text || '');
  const clipped = safeText.slice(0, limitChars);

  const inRange = (entities || [])
    .filter((entity) => Number.isInteger(entity?.start_char) && Number.isInteger(entity?.end_char))
    .filter((entity) => entity.start_char >= 0 && entity.end_char > entity.start_char)
    .filter((entity) => entity.start_char < clipped.length)
    .sort((a, b) => a.start_char - b.start_char);

  const nonOverlapping = [];
  let cursor = -1;
  for (const entity of inRange) {
    if (entity.start_char >= cursor) {
      nonOverlapping.push(entity);
      cursor = entity.end_char;
    }
  }

  return {
    text: clipped,
    entities: nonOverlapping
  };
}

function buildHtml(data) {
  const summaryScores = scoreSummary(data.summary_evaluation || {});
  const ragStatus = getRagStatus(data.auditFlags || []);
  const counts = severityCounts(data.auditFlags || []);
  const entitySample = buildEntitySample(data.extractedText || '', data.entities || []);

  const pageData = {
    generatedAt: new Date().toISOString(),
    sourceName: data.originalName || 'NLP payload',
    summaryScores,
    ragStatus,
    severityCounts: counts,
    auditFlags: data.auditFlags || [],
    entitySample,
    entities: data.entities || []
  };

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NLP Insights Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
  <style>
    :root {
      --bg: #f4f5f7;
      --ink: #1e1f24;
      --muted: #5c6070;
      --card: #ffffff;
      --accent: #1f6feb;
      --rouge: #e34f6f;
      --bleu: #3f8efc;
      --high: #c81e1e;
      --medium: #d97706;
      --low: #15803d;
      --other: #6b7280;
      --entity-default: #fef3c7;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      background: radial-gradient(circle at top right, #e7eefc 0%, var(--bg) 45%);
      color: var(--ink);
    }

    .wrap {
      max-width: 1250px;
      margin: 28px auto;
      padding: 0 16px 36px;
    }

    .hero {
      background: linear-gradient(135deg, #0f172a 0%, #243b64 45%, #1f6feb 100%);
      color: #f8fbff;
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
      margin-bottom: 20px;
    }

    .hero h1 {
      margin: 0 0 8px;
      font-size: 1.8rem;
    }

    .hero p {
      margin: 6px 0;
      line-height: 1.6;
      color: #dbeafe;
      font-size: 0.95rem;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 16px;
    }

    .card {
      background: var(--card);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 8px rgba(22, 28, 45, 0.08);
    }

    .card h2 {
      margin: 0 0 8px;
      font-size: 1.1rem;
    }

    .desc {
      margin: 0 0 12px;
      color: var(--muted);
      line-height: 1.5;
      font-size: 0.9rem;
    }

    .chart { width: 100%; height: 290px; }

    .entity-sample {
      background: #fafafa;
      border: 1px solid #ececec;
      border-radius: 10px;
      padding: 12px;
      white-space: pre-wrap;
      line-height: 1.7;
      max-height: 320px;
      overflow: auto;
      font-size: 0.92rem;
    }

    .entity {
      border-radius: 4px;
      padding: 0 4px;
      border: 1px solid transparent;
    }

    .legend {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 10px;
      font-size: 0.82rem;
    }

    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #f8fafc;
      border: 1px solid #e5e7eb;
      border-radius: 99px;
      padding: 4px 10px;
    }

    .swatch {
      width: 12px;
      height: 12px;
      border-radius: 3px;
    }

    .traffic-row {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin: 10px 0 6px;
    }

    .light {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid #d1d5db;
      background: #f3f4f6;
      opacity: 0.35;
      transition: all .25s ease;
    }

    .light.active { opacity: 1; transform: scale(1.06); }
    .light.red.active { background: #ef4444; border-color: #dc2626; }
    .light.amber.active { background: #f59e0b; border-color: #d97706; }
    .light.green.active { background: #22c55e; border-color: #16a34a; }

    .flag-list {
      margin-top: 8px;
      max-height: 220px;
      overflow: auto;
      border: 1px solid #ececec;
      border-radius: 8px;
      padding: 8px;
      background: #fcfcfd;
    }

    .flag-item {
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px dashed #e5e7eb;
      font-size: 0.88rem;
    }

    .flag-item:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: 0;
    }

    .badge {
      display: inline-block;
      border-radius: 99px;
      padding: 2px 8px;
      font-size: 0.74rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-right: 6px;
    }

    .badge.high { background: #fee2e2; color: #991b1b; }
    .badge.medium { background: #ffedd5; color: #9a3412; }
    .badge.low { background: #dcfce7; color: #166534; }
    .badge.other { background: #e5e7eb; color: #374151; }
  </style>
</head>
<body>
  <div class="wrap">
    <section class="hero">
      <h1>NLP Results Dashboard (D3)</h1>
      <p><strong>Source:</strong> ${pageData.sourceName}</p>
      <p><strong>Generated:</strong> ${pageData.generatedAt}</p>
      <p>
        This dashboard explains three things at once: summary quality (ROUGE/BLEU), entity extraction quality
        (highlighted NER spans), and audit risk posture (traffic-light + anomaly counts).
      </p>
    </section>

    <section class="grid">
      <article class="card">
        <h2>ROUGE / BLEU Results Graph</h2>
        <p class="desc">
          Higher scores mean the generated summary is closer to the reference text.
          ROUGE is recall-friendly: it rewards covering important source content. BLEU is precision-focused:
          it rewards exact n-gram phrasing and order, and it penalizes short or generic summaries.
        </p>
        <p class="desc">
          How to read these bars:
          ROUGE-1 checks single-word overlap, ROUGE-2 checks phrase overlap (two-word sequences),
          and ROUGE-L checks sentence-level structure via longest common subsequence.
          BLEU-1 to BLEU-4 become progressively stricter, with BLEU-4 requiring strong multi-word fidelity.
          A practical signal is "high ROUGE + lower BLEU": content is mostly correct but wording differs.
          "High ROUGE + high BLEU" usually means both meaning and phrasing are close to reference quality.
        </p>
        <svg id="metricChart" class="chart"></svg>
      </article>

      <article class="card">
        <h2>NER Output Example (Highlighted Entities)</h2>
        <p class="desc">
          Colored spans show entities found in extracted text. Use this to verify whether key organizations,
          amounts, and dates are being captured in context.
        </p>
        <div id="entitySample" class="entity-sample"></div>
        <div id="entityLegend" class="legend"></div>
      </article>

      <article class="card">
        <h2>Traffic-Light Anomaly Output</h2>
        <p class="desc">
          The active traffic light shows current RAG status from the audit flags. The bar chart summarizes how many
          anomalies were high, medium, and low severity.
        </p>
        <div class="traffic-row" id="trafficLights">
          <div class="light red" data-status="red" title="Red"></div>
          <div class="light amber" data-status="amber" title="Amber"></div>
          <div class="light green" data-status="green" title="Green"></div>
        </div>
        <svg id="anomalyChart" class="chart"></svg>
      </article>

      <article class="card">
        <h2>Anomaly Explanation List</h2>
        <p class="desc">
          Each anomaly includes severity, rule id, and message. This is the quickest place to explain why the
          traffic light is red/amber/green for non-technical stakeholders.
        </p>
        <div id="flagList" class="flag-list"></div>
      </article>
    </section>
  </div>

  <script>
    const pageData = ${JSON.stringify(pageData)};

    function drawMetricChart() {
      const metricRows = [
        ...pageData.summaryScores.rouge.map((m) => ({ ...m, family: 'ROUGE' })),
        ...pageData.summaryScores.bleu.map((m) => ({ ...m, family: 'BLEU' }))
      ];

      const svg = d3.select('#metricChart');
      const width = svg.node().clientWidth || 520;
      const height = svg.node().clientHeight || 290;
      svg.attr('viewBox', '0 0 ' + width + ' ' + height);

      const margin = { top: 16, right: 14, bottom: 80, left: 48 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      const x = d3.scaleBand()
        .domain(metricRows.map((d) => d.metric))
        .range([0, innerW])
        .padding(0.22);

      const y = d3.scaleLinear()
        .domain([0, 100])
        .nice()
        .range([innerH, 0]);

      g.append('g')
        .call(d3.axisLeft(y).ticks(5).tickFormat((d) => d + '%'))
        .call((axis) => axis.selectAll('path,line').attr('stroke', '#d1d5db'));

      g.append('g')
        .attr('transform', 'translate(0,' + innerH + ')')
        .call(d3.axisBottom(x))
        .call((axis) => axis.selectAll('text')
          .attr('transform', 'rotate(-25)')
          .style('text-anchor', 'end'))
        .call((axis) => axis.selectAll('path,line').attr('stroke', '#d1d5db'));

      g.selectAll('rect.metric')
        .data(metricRows)
        .enter()
        .append('rect')
        .attr('class', 'metric')
        .attr('x', (d) => x(d.metric))
        .attr('y', (d) => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', (d) => innerH - y(d.value))
        .attr('rx', 5)
        .attr('fill', (d) => d.family === 'ROUGE' ? 'var(--rouge)' : 'var(--bleu)');

      g.selectAll('text.value')
        .data(metricRows)
        .enter()
        .append('text')
        .attr('x', (d) => (x(d.metric) || 0) + x.bandwidth() / 2)
        .attr('y', (d) => y(d.value) - 6)
        .attr('text-anchor', 'middle')
        .style('font-size', '11px')
        .style('font-weight', '600')
        .text((d) => d.value + '%');
    }

    function drawEntityHighlights() {
      const container = d3.select('#entitySample');
      const legend = d3.select('#entityLegend');
      const text = pageData.entitySample.text || '';
      const entities = Array.isArray(pageData.entitySample.entities) ? pageData.entitySample.entities : [];

      if (!text) {
        container.text('No extracted text available for NER highlighting.');
        return;
      }

      const labels = Array.from(new Set(entities.map((e) => e.label || 'UNKNOWN')));
      const colors = d3.scaleOrdinal()
        .domain(labels)
        .range(d3.schemeSet3.concat(d3.schemeTableau10));

      let cursor = 0;
      for (const entity of entities) {
        const start = entity.start_char;
        const end = Math.min(entity.end_char, text.length);

        if (start > cursor) {
          container.append('span').text(text.slice(cursor, start));
        }

        container.append('span')
          .attr('class', 'entity')
          .style('background', colors(entity.label || 'UNKNOWN'))
          .style('border-color', d3.color(colors(entity.label || 'UNKNOWN')).darker(0.6))
          .text(text.slice(start, end))
          .append('title')
          .text((entity.label || 'UNKNOWN') + ': ' + (entity.text || ''));

        cursor = end;
      }

      if (cursor < text.length) {
        container.append('span').text(text.slice(cursor));
      }

      const counts = d3.rollups(
        entities,
        (v) => v.length,
        (d) => d.label || 'UNKNOWN'
      ).sort((a, b) => b[1] - a[1]);

      if (!counts.length) {
        legend.append('div').attr('class', 'legend-item').text('No entities found in sampled text window.');
        return;
      }

      legend.selectAll('div.legend-item')
        .data(counts)
        .enter()
        .append('div')
        .attr('class', 'legend-item')
        .html(([label, count]) => '<span class="swatch" style="background:' + colors(label) + '"></span>' + label + ' (' + count + ')');
    }

    function drawTrafficAndAnomalies() {
      const status = pageData.ragStatus || 'unknown';
      d3.selectAll('#trafficLights .light')
        .classed('active', function () {
          return this.dataset.status === status;
        });

      const severityData = [
        { label: 'high', value: pageData.severityCounts.high || 0, color: 'var(--high)' },
        { label: 'medium', value: pageData.severityCounts.medium || 0, color: 'var(--medium)' },
        { label: 'low', value: pageData.severityCounts.low || 0, color: 'var(--low)' },
        { label: 'other', value: pageData.severityCounts.other || 0, color: 'var(--other)' }
      ];

      const svg = d3.select('#anomalyChart');
      const width = svg.node().clientWidth || 520;
      const height = svg.node().clientHeight || 290;
      svg.attr('viewBox', '0 0 ' + width + ' ' + height);

      const margin = { top: 12, right: 12, bottom: 40, left: 78 };
      const innerW = width - margin.left - margin.right;
      const innerH = height - margin.top - margin.bottom;

      const g = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      const y = d3.scaleBand()
        .domain(severityData.map((d) => d.label))
        .range([0, innerH])
        .padding(0.2);

      const maxValue = Math.max(1, d3.max(severityData, (d) => d.value) || 1);
      const x = d3.scaleLinear()
        .domain([0, maxValue])
        .nice()
        .range([0, innerW]);

      g.append('g')
        .call(d3.axisLeft(y))
        .call((axis) => axis.selectAll('path,line').attr('stroke', '#d1d5db'));

      g.append('g')
        .attr('transform', 'translate(0,' + innerH + ')')
        .call(d3.axisBottom(x).ticks(Math.min(6, maxValue)).tickFormat(d3.format('d')))
        .call((axis) => axis.selectAll('path,line').attr('stroke', '#d1d5db'));

      g.selectAll('rect.row')
        .data(severityData)
        .enter()
        .append('rect')
        .attr('class', 'row')
        .attr('x', 0)
        .attr('y', (d) => y(d.label))
        .attr('height', y.bandwidth())
        .attr('width', (d) => x(d.value))
        .attr('fill', (d) => d.color)
        .attr('rx', 6);

      g.selectAll('text.count')
        .data(severityData)
        .enter()
        .append('text')
        .attr('x', (d) => x(d.value) + 8)
        .attr('y', (d) => (y(d.label) || 0) + y.bandwidth() / 2 + 4)
        .style('font-size', '12px')
        .style('font-weight', '600')
        .text((d) => d.value);

      const list = d3.select('#flagList');
      const flags = Array.isArray(pageData.auditFlags) ? pageData.auditFlags : [];

      if (!flags.length) {
        list.append('div').attr('class', 'flag-item').text('No audit flags were returned in this payload.');
        return;
      }

      flags.forEach((flag) => {
        const severity = String(flag.severity || 'other').toLowerCase();
        const badgeClass = ['high', 'medium', 'low'].includes(severity) ? severity : 'other';
        const title = flag.title || flag.id || 'Audit Flag';
        const msg = flag.message || '';

        const item = list.append('div').attr('class', 'flag-item');
        item.html('<span class="badge ' + badgeClass + '">' + severity + '</span><strong>' + title + '</strong>');
        if (msg) {
          item.append('div').style('margin-top', '4px').text(msg);
        }
      });
    }

    drawMetricChart();
    drawEntityHighlights();
    drawTrafficAndAnomalies();
  </script>
</body>
</html>`;
}

async function run() {
  const args = process.argv.slice(2);

  let payload;
  const docFlagIndex = args.indexOf('--doc');

  if (docFlagIndex !== -1) {
    // --doc <id> — load a specific document from the database
    const docId = args[docFlagIndex + 1];
    if (!docId) {
      throw new Error('--doc requires a document ID argument, e.g. --doc 8');
    }
    console.log(`Loading document ID ${docId} from database...`);
    payload = await loadFromDatabase(docId);
  } else if (args[0] && !args[0].startsWith('--')) {
    // Positional argument — load from a JSON file
    console.log(`Loading from file: ${args[0]}`);
    payload = loadFromJsonFile(args[0]);
  } else {
    // Default — pick the most recent processed document from the database
    console.log('Loading most recent processed document from database...');
    payload = await loadFromDatabase(null);
  }

  console.log(`Source: ${payload.originalName}`);

  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  const outputPath = path.join(RESULTS_DIR, 'latest-insights.html');

  fs.writeFileSync(outputPath, buildHtml(payload), 'utf-8');

  console.log(`D3 dashboard written to: ${outputPath}`);
  console.log('Opening in browser...');

  const command = process.platform === 'win32'
    ? `start "" "${outputPath}"`
    : process.platform === 'darwin'
      ? `open "${outputPath}"`
      : `xdg-open "${outputPath}"`;

  exec(command);
}

run();
