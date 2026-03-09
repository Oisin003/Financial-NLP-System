/**
 * NER (Named Entity Recognition) Accuracy Test
 * 
 * This test file evaluates the accuracy of the NER service by comparing
 * extracted entities against known ground truth from sample financial documents.
 * 
 * Metrics calculated:
 * - Precision: Of entities extracted, how many were correct?
 * - Recall: Of actual entities, how many were found?
 * - F1 Score: Harmonic mean of precision and recall
 * 
 * Run: node --experimental-vm-modules node_modules/jest/bin/jest.js server/tests/nerAccuracy.test.js
 */

import fetch from 'node-fetch';

/**
 * Helper: compute the average of numeric values in an array.
 * Returns 0 when the array is empty to avoid division errors.
 */
function average(values) {
  if (!values || values.length === 0) {
    return 0;
  }

  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
  }

  return total / values.length;
}

// ==========================================
// SAMPLE FINANCIAL DOCUMENTS WITH GROUND TRUTH
// ==========================================

const testCases = [
  {
    name: 'Annual Report Extract',
    text: `Apple Inc. reported revenue of $394.3 billion for fiscal year 2022. 
           CEO Tim Cook announced the results on January 26, 2023 at the company's 
           headquarters in Cupertino, California. The company saw a 7.8% increase 
           compared to 2021. Microsoft Corporation and Google LLC remain key competitors.`,
    expectedEntities: {
      ORG: ['Apple Inc.', 'Microsoft Corporation', 'Google LLC'],
      PERSON: ['Tim Cook'],
      MONEY: ['$394.3 billion'],
      DATE: ['fiscal year 2022', 'January 26, 2023', '2021'],
      GPE: ['Cupertino', 'California'],
      PERCENT: ['7.8%']
    }
  },
  {
    name: 'Earnings Call Summary',
    text: `During Q3 2023, Amazon Web Services generated $22.1 billion in revenue. 
           CFO Brian Olsavsky noted that operating income reached $5.4 billion, 
           representing a 24.5% margin. The Seattle-based company employed 1.5 million 
           people worldwide as of September 30, 2023.`,
    expectedEntities: {
      ORG: ['Amazon Web Services'],
      PERSON: ['Brian Olsavsky'],
      MONEY: ['$22.1 billion', '$5.4 billion'],
      DATE: ['Q3 2023', 'September 30, 2023'],
      GPE: ['Seattle'],
      PERCENT: ['24.5%'],
      CARDINAL: ['1.5 million']
    }
  },
  {
    name: 'Merger Announcement',
    text: `JPMorgan Chase & Co. announced the acquisition of First Republic Bank 
           for approximately $10.6 billion on May 1, 2023. Chairman Jamie Dimon 
           stated this strengthens their position in San Francisco and Los Angeles 
           markets. The deal was approved by the FDIC.`,
    expectedEntities: {
      ORG: ['JPMorgan Chase & Co.', 'First Republic Bank', 'FDIC'],
      PERSON: ['Jamie Dimon'],
      MONEY: ['$10.6 billion'],
      DATE: ['May 1, 2023'],
      GPE: ['San Francisco', 'Los Angeles']
    }
  },
  {
    name: 'UK Financial Statement',
    text: `Barclays PLC reported pre-tax profit of £8.4 billion for the year ended 
           31 December 2022. The London-headquartered bank increased dividends by 
           20% to shareholders. CEO C.S. Venkatakrishnan highlighted growth in the 
           United Kingdom and European markets.`,
    expectedEntities: {
      ORG: ['Barclays PLC'],
      PERSON: ['C.S. Venkatakrishnan'],
      MONEY: ['£8.4 billion'],
      DATE: ['31 December 2022'],
      GPE: ['London', 'United Kingdom'],
      PERCENT: ['20%']
    }
  },
  {
    name: 'Investment Fund Report',
    text: `BlackRock Inc. manages over $9.1 trillion in assets under management 
           as of December 2023. CEO Larry Fink addressed ESG concerns at the 
           World Economic Forum in Davos, Switzerland. The firm operates in 
           30 countries with 18,000 employees.`,
    expectedEntities: {
      ORG: ['BlackRock Inc.', 'World Economic Forum'],
      PERSON: ['Larry Fink'],
      MONEY: ['$9.1 trillion'],
      DATE: ['December 2023'],
      GPE: ['Davos', 'Switzerland'],
      CARDINAL: ['30', '18,000']
    }
  }
];


// ==========================================
// HELPER FUNCTIONS FOR ACCURACY CALCULATION
// ==========================================

/**
 * Normalize entity text for comparison (lowercase, trim whitespace)
 */
function normalizeEntity(text) {
  return text.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Calculate precision, recall, and F1 score
 * @param {Set} extracted - Set of extracted entity texts
 * @param {Set} expected - Set of expected entity texts
 * @returns {Object} - { precision, recall, f1 }
 */
function calculateMetrics(extracted, expected) {
  // Normalize both sets so matching is case-insensitive and whitespace-safe.
  const extractedNorm = new Set([...extracted].map(normalizeEntity));
  const expectedNorm = new Set([...expected].map(normalizeEntity));
  
  // True positives: entities that were both extracted and expected
  let truePositives = 0;
  for (const entity of extractedNorm) {
    if (expectedNorm.has(entity)) {
      truePositives++;
    }
  }
  
  // Precision: TP / (TP + FP) = TP / extracted count
  const precision = extractedNorm.size > 0 ? truePositives / extractedNorm.size : 0;
  
  // Recall: TP / (TP + FN) = TP / expected count
  const recall = expectedNorm.size > 0 ? truePositives / expectedNorm.size : 0;
  
  // F1 Score: harmonic mean of precision and recall
  const f1 = (precision + recall) > 0 
    ? (2 * precision * recall) / (precision + recall) 
    : 0;
  
  return {
    precision: Math.round(precision * 100) / 100,
    recall: Math.round(recall * 100) / 100,
    f1: Math.round(f1 * 100) / 100,
    truePositives,
    extractedCount: extractedNorm.size,
    expectedCount: expectedNorm.size
  };
}


// ==========================================
// NER SERVICE CALL
// ==========================================

/**
 * Call the NER microservice to extract entities
 * @param {string} text - Text to analyze
 * @returns {Promise<Array>} - Array of entity objects
 */
async function callNERService(text) {
  const response = await fetch('http://127.0.0.1:8000/ner', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  if (!response.ok) {
    throw new Error(`NER service error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.entities;
}

/**
 * Group entities by their label type
 * @param {Array} entities - Array of entity objects
 * @returns {Object} - Map of label -> array of entity texts
 */
function groupEntitiesByLabel(entities) {
  // Build an object like:
  // { ORG: ['Apple Inc.'], PERSON: ['Tim Cook'] }
  const grouped = {};
  for (const entity of entities) {
    if (!grouped[entity.label]) {
      grouped[entity.label] = [];
    }
    grouped[entity.label].push(entity.text);
  }
  return grouped;
}


// ==========================================
// JEST TEST SUITE
// ==========================================

describe('NER Accuracy Tests', () => {
  // Increase timeout for API calls
  jest.setTimeout(30000);
  
  // Store results for final summary
  const allResults = [];

  // Test each sample document
  test.each(testCases)('$name - Entity Extraction', async (testCase) => {
    // Call NER service
    const extractedEntities = await callNERService(testCase.text);
    const extractedGrouped = groupEntitiesByLabel(extractedEntities);
    
    // Calculate metrics for each entity type (ORG, PERSON, MONEY, etc.)
    const typeResults = {};
    const allEntityTypes = new Set([
      ...Object.keys(testCase.expectedEntities),
      ...Object.keys(extractedGrouped)
    ]);
    
    for (const entityType of allEntityTypes) {
      const extracted = new Set(extractedGrouped[entityType] || []);
      const expected = new Set(testCase.expectedEntities[entityType] || []);
      
      if (expected.size > 0 || extracted.size > 0) {
        typeResults[entityType] = calculateMetrics(extracted, expected);
      }
    }
    
    // Calculate overall metrics by flattening entities into "LABEL:text" pairs.
    // This gives one global score per document.
    const allExtracted = new Set(extractedEntities.map(e => `${e.label}:${e.text}`));
    const allExpected = new Set();
    for (const [type, entities] of Object.entries(testCase.expectedEntities)) {
      for (const entity of entities) {
        allExpected.add(`${type}:${entity}`);
      }
    }
    const overallMetrics = calculateMetrics(allExtracted, allExpected);
    
    // Save per-document results so the final summary test can aggregate all documents.
    allResults.push({
      name: testCase.name,
      typeResults,
      overall: overallMetrics,
      extractedGrouped,
      expectedEntities: testCase.expectedEntities
    });
    
    // Log detailed results
    console.log(`\n[INFO] ${testCase.name}`);
    console.log('-'.repeat(50));
    
    for (const [type, metrics] of Object.entries(typeResults)) {
      const status = metrics.recall >= 0.5 ? '[success]' : '[danger]';
      console.log(`  ${status} ${type.padEnd(10)} | P: ${metrics.precision.toFixed(2)} | R: ${metrics.recall.toFixed(2)} | F1: ${metrics.f1.toFixed(2)}`);
      
      // Show what was found vs expected
      const found = extractedGrouped[type] || [];
      const expected = testCase.expectedEntities[type] || [];
      if (found.length > 0) {
        console.log(`    Found: ${found.slice(0, 3).join(', ')}${found.length > 3 ? '...' : ''}`);
      }
      if (expected.length > 0) {
        console.log(`    Expected: ${expected.slice(0, 3).join(', ')}${expected.length > 3 ? '...' : ''}`);
      }
    }
    
    console.log('-'.repeat(50));
    console.log(`  OVERALL | P: ${overallMetrics.precision.toFixed(2)} | R: ${overallMetrics.recall.toFixed(2)} | F1: ${overallMetrics.f1.toFixed(2)}`);
    
    // Assertions - document should have reasonable entity extraction
    // We use soft thresholds since spaCy won't match everything perfectly
    expect(overallMetrics.recall).toBeGreaterThan(0.3); // At least 30% of expected entities found
  });


  // Final summary test
  // This runs after per-document tests and prints a compact report.
  test('Overall Accuracy Summary', () => {
    if (allResults.length === 0) {
      console.log('No test results to summarize');
      return;
    }
    
    console.log('\n\n' + '='.repeat(60));
    console.log('NER ACCURACY SUMMARY REPORT');
    console.log('='.repeat(60));
    
    // Calculate average metrics across all test cases.
    // We keep this explicit so each step is easy to follow.
    const precisionValues = [];
    const recallValues = [];
    const f1Values = [];

    for (const result of allResults) {
      precisionValues.push(result.overall.precision);
      recallValues.push(result.overall.recall);
      f1Values.push(result.overall.f1);
    }

    const avgPrecision = average(precisionValues);
    const avgRecall = average(recallValues);
    const avgF1 = average(f1Values);
    
    console.log(`\nTest Documents: ${allResults.length}`);
    console.log(`Average Precision: ${(avgPrecision * 100).toFixed(1)}%`);
    console.log(`Average Recall: ${(avgRecall * 100).toFixed(1)}%`);
    console.log(`Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`);
    
    // Per-type breakdown
    console.log('\nPer-Entity-Type Performance:');
    console.log('-'.repeat(50));
    
    const typeAggregates = {};
    for (const result of allResults) {
      for (const [type, metrics] of Object.entries(result.typeResults)) {
        if (!typeAggregates[type]) {
          typeAggregates[type] = { precision: [], recall: [], f1: [] };
        }
        typeAggregates[type].precision.push(metrics.precision);
        typeAggregates[type].recall.push(metrics.recall);
        typeAggregates[type].f1.push(metrics.f1);
      }
    }
    
    const sortedTypes = Object.entries(typeAggregates).sort((a, b) => b[1].f1.length - a[1].f1.length);
    
    for (const [type, metrics] of sortedTypes) {
      const avgP = average(metrics.precision);
      const avgR = average(metrics.recall);
      const avgF = average(metrics.f1);
      const grade = avgF >= 0.7 ? '[success]' : avgF >= 0.4 ? '[warning]' : '[danger]';
      
      console.log(`${grade} ${type.padEnd(12)} | P: ${(avgP * 100).toFixed(0).padStart(3)}% | R: ${(avgR * 100).toFixed(0).padStart(3)}% | F1: ${(avgF * 100).toFixed(0).padStart(3)}% (n=${metrics.f1.length})`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('Legend: [success] Good (F1>=70%) | [warning] Fair (F1>=40%) | [danger] Needs Work (F1<40%)');
    console.log('='.repeat(60) + '\n');
    
    // Store summary for documentation
    // Build a documentation-friendly JSON summary.
    // This is useful for saving in reports or PR notes.
    const perTypeMetrics = {};
    for (const [type, m] of sortedTypes) {
      perTypeMetrics[type] = {
        precision: Math.round(average(m.precision) * 100),
        recall: Math.round(average(m.recall) * 100),
        f1: Math.round(average(m.f1) * 100)
      };
    }

    const summary = {
      timestamp: new Date().toISOString(),
      testCount: allResults.length,
      averageMetrics: {
        precision: Math.round(avgPrecision * 100),
        recall: Math.round(avgRecall * 100),
        f1: Math.round(avgF1 * 100)
      },
      perTypeMetrics
    };
    
    console.log('Summary JSON (for documentation):');
    console.log(JSON.stringify(summary, null, 2));
    
    // Assertions for overall quality
    expect(avgF1).toBeGreaterThan(0.35); // Average F1 should be above 35%
  });
});


// ==========================================
// STANDALONE RUNNER (for running without Jest)
// ==========================================

/**
 * Run accuracy tests directly without Jest
 * Usage: node server/tests/nerAccuracy.test.js --standalone
 */
async function runStandalone() {
  console.log('[INFO] NER Accuracy Test - Standalone Mode\n');
  
  const results = [];
  
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}...`);
    
    try {
      const extractedEntities = await callNERService(testCase.text);
      const extractedGrouped = groupEntitiesByLabel(extractedEntities);
      
      // Calculate overall metrics
      const allExtracted = new Set(extractedEntities.map(e => `${e.label}:${e.text}`));
      const allExpected = new Set();
      for (const [type, entities] of Object.entries(testCase.expectedEntities)) {
        for (const entity of entities) {
          allExpected.add(`${type}:${entity}`);
        }
      }
      
      const metrics = calculateMetrics(allExtracted, allExpected);
      results.push({ name: testCase.name, ...metrics });
      
      console.log(`  [success] Precision: ${(metrics.precision * 100).toFixed(1)}% | Recall: ${(metrics.recall * 100).toFixed(1)}% | F1: ${(metrics.f1 * 100).toFixed(1)}%`);
      
      // Show detailed comparison
      console.log('\n  Extracted entities:');
      for (const [type, entities] of Object.entries(extractedGrouped)) {
        console.log(`    ${type}: ${entities.join(', ')}`);
      }
      console.log('\n  Expected entities:');
      for (const [type, entities] of Object.entries(testCase.expectedEntities)) {
        console.log(`    ${type}: ${entities.join(', ')}`);
      }
      console.log('');
      
    } catch (error) {
      console.log(`  [danger] Error: ${error.message}`);
      results.push({ name: testCase.name, error: error.message });
    }
  }
  
  // Summary
  // If at least one test case succeeded, print overall averages.
  const validResults = results.filter(r => !r.error);
  if (validResults.length > 0) {
    const precisionValues = [];
    const recallValues = [];
    const f1Values = [];

    for (const result of validResults) {
      precisionValues.push(result.precision);
      recallValues.push(result.recall);
      f1Values.push(result.f1);
    }

    const avgP = average(precisionValues);
    const avgR = average(recallValues);
    const avgF1 = average(f1Values);
    
    console.log('\n' + '='.repeat(50));
    console.log('SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tests passed: ${validResults.length}/${testCases.length}`);
    console.log(`Average Precision: ${(avgP * 100).toFixed(1)}%`);
    console.log(`Average Recall: ${(avgR * 100).toFixed(1)}%`);
    console.log(`Average F1 Score: ${(avgF1 * 100).toFixed(1)}%`);
    console.log('='.repeat(50));
  }
}

// Check if running standalone
if (process.argv.includes('--standalone')) {
  runStandalone().catch(console.error);
}
