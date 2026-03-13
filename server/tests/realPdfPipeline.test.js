/**
 * Real PDF NLP Pipeline Tests
 *
 * Reads any PDF files placed in server/uploads/documents/, extracts their
 * text using pdf-parse (already a server dependency), then runs the core
 * in-process NLP steps against that real content:
 *   - Text extraction
 *   - Tokenisation and stopword removal
 *   - Lemmatisation and word frequency
 *   - Audit flag detection (RAG, debt burden, going concern, gross margin)
 *
 * No Tika server or Python microservice is required — those layers are not
 * exercised here. The goal is to validate that the NLP logic behaves
 * correctly when given genuine financial document text.
 *
 * Tests skip automatically when the uploads folder is empty.
 *
 * To run:
 *   cd server
 *   node --experimental-vm-modules node_modules/jest/bin/jest.js server/tests/realPdfPipeline.test.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Import the library directly to avoid the self-test that runs in index.js
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import {
  tokenizeText,
  removeStopwords,
  lemmatizeTokens,
  analyzeAuditFlags
} from '../services/nlpProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, '../uploads/documents');

// Collect PDF filenames from the uploads folder.
function getUploadedPdfs() {
  if (!fs.existsSync(UPLOADS_DIR)) return [];
  return fs.readdirSync(UPLOADS_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
}

const uploadedPdfs = getUploadedPdfs();

// ==========================================
// SUITE: no PDFs present
// ==========================================
if (uploadedPdfs.length === 0) {
  describe('Real PDF NLP Pipeline', () => {
    test('skipped — no PDFs found in uploads/documents/', () => {
      console.info(
        'Place PDF files in server/uploads/documents/ to run the real-PDF pipeline tests.'
      );
      expect(true).toBe(true);
    });
  });
}

// ==========================================
// SUITE: PDFs are present
// ==========================================
if (uploadedPdfs.length > 0) {

  describe('Real PDF NLP Pipeline', () => {

    // ------------------------------------------
    // TEST 1: Text extraction
    // ------------------------------------------
    test.each(uploadedPdfs)(
      'Extracts text from %s',
      async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const dataBuffer = fs.readFileSync(filePath);
        const parsed = await pdfParse(dataBuffer);

        expect(typeof parsed.text).toBe('string');
        expect(typeof parsed.numpages).toBe('number');
        expect(parsed.numpages).toBeGreaterThan(0);

        console.log(
          `[${filename}] ${parsed.numpages} page(s), ${parsed.text.length} characters extracted`
        );
      },
      30000
    );

    // ------------------------------------------
    // TEST 2: Tokenisation and stopword removal
    // ------------------------------------------
    test.each(uploadedPdfs)(
      'Tokenises and removes stopwords from %s',
      async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const { text } = await pdfParse(fs.readFileSync(filePath));

        if (!text || text.trim().length < 30) {
          console.warn(`[${filename}] Insufficient text — skipping tokenisation checks`);
          return;
        }

        const tokens = tokenizeText(text);
        const filtered = removeStopwords(tokens);

        expect(Array.isArray(tokens)).toBe(true);
        expect(tokens.length).toBeGreaterThan(0);
        expect(Array.isArray(filtered)).toBe(true);
        // Stopword removal can only reduce or maintain the token count.
        expect(filtered.length).toBeLessThanOrEqual(tokens.length);

        console.log(
          `[${filename}] ${tokens.length} tokens → ${filtered.length} after stopword removal`
        );
      },
      30000
    );

    // ------------------------------------------
    // TEST 3: Lemmatisation and top-word summary
    // ------------------------------------------
    test.each(uploadedPdfs)(
      'Produces word frequency map for %s',
      async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const { text } = await pdfParse(fs.readFileSync(filePath));

        if (!text || text.trim().length < 30) {
          console.warn(`[${filename}] Insufficient text — skipping word frequency checks`);
          return;
        }

        const tokens = tokenizeText(text);
        const filtered = removeStopwords(tokens);
        const lemmas = lemmatizeTokens(filtered);

        expect(Array.isArray(lemmas)).toBe(true);

        const wordFrequency = {};
        for (const token of lemmas) {
          wordFrequency[token] = (wordFrequency[token] || 0) + 1;
        }

        expect(Object.keys(wordFrequency).length).toBeGreaterThan(0);

        const top10 = Object.entries(wordFrequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word, count]) => `${word}(${count})`);

        console.log(`[${filename}] Top 10 words: ${top10.join(', ')}`);
      },
      30000
    );

    // ------------------------------------------
    // TEST 4: Audit flag detection
    // ------------------------------------------
    test.each(uploadedPdfs)(
      'Runs audit flag detection on %s',
      async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const { text } = await pdfParse(fs.readFileSync(filePath));

        if (!text || text.trim().length < 30) {
          console.warn(`[${filename}] Insufficient text — skipping audit flag checks`);
          return;
        }

        const flags = analyzeAuditFlags(text);

        expect(Array.isArray(flags)).toBe(true);

        // Every flag must follow the expected schema.
        for (const flag of flags) {
          expect(flag).toHaveProperty('id');
          expect(flag).toHaveProperty('severity');
          expect(flag).toHaveProperty('title');
          expect(flag).toHaveProperty('message');
          expect(flag).toHaveProperty('evidence');
          expect(['high', 'medium', 'low']).toContain(flag.severity);
        }

        if (flags.length > 0) {
          console.log(`[${filename}] ${flags.length} audit flag(s):`);
          for (const f of flags) {
            console.log(`  [${f.severity.toUpperCase()}] ${f.title} — ${f.message}`);
          }
        } else {
          console.log(`[${filename}] No audit flags raised`);
        }
      },
      30000
    );

    // ------------------------------------------
    // TEST 5: RAG status is always a known value
    // ------------------------------------------
    test.each(uploadedPdfs)(
      'RAG status is red, amber, green, or unknown for %s',
      async (filename) => {
        const filePath = path.join(UPLOADS_DIR, filename);
        const { text } = await pdfParse(fs.readFileSync(filePath));

        if (!text || text.trim().length < 30) {
          console.warn(`[${filename}] Insufficient text — skipping RAG status check`);
          return;
        }

        const flags = analyzeAuditFlags(text);
        const ragFlag = flags.find(f => f.id === 'rag-status');
        const incompleteFlag = flags.find(f => f.id === 'incomplete-data');

        if (ragFlag) {
          expect(['red', 'amber', 'green']).toContain(ragFlag.evidence.ragStatus);
          console.log(`[${filename}] RAG status: ${ragFlag.evidence.ragStatus.toUpperCase()}`);
        } else if (incompleteFlag) {
          console.log(
            `[${filename}] RAG undetermined — missing: ${incompleteFlag.evidence.missingMetrics.join(', ')}`
          );
        } else {
          console.log(`[${filename}] No RAG or incomplete-data flag produced`);
        }
      },
      30000
    );
  });
}
