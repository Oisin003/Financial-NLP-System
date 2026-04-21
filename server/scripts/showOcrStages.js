import fs from 'fs';
import path from 'path';

const TIKA_URL = process.env.TIKA_URL || 'http://localhost:9998/tika';

function toPrintableAscii(text) {
  return text.replace(/[^\x20-\x7E]/g, '.');
}

function previewText(text, maxChars = 500) {
  const snippet = (text || '').slice(0, maxChars);
  return snippet.replace(/\r/g, '\\r').replace(/\n/g, '\\n\n');
}

function cleanOcrText(text) {
  const withoutTags = (text || '').replace(/<[^>]+>/g, '\n');
  const normalizedLines = withoutTags
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);
  return normalizedLines.join('\n');
}

async function extractTextFromTika(pdfBuffer, options = {}) {
  const headers = {
    'Content-Type': 'application/pdf',
    Accept: 'text/plain'
  };

  if (options.ocr === true) {
    headers['X-Tika-OCRLanguage'] = 'eng';
    headers['X-Tika-PDFOcrStrategy'] = 'ocr_and_text';
  }

  const response = await fetch(TIKA_URL, {
    method: 'PUT',
    headers,
    body: pdfBuffer
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Tika extraction failed (${response.status})${errorBody ? `: ${errorBody}` : ''}`);
  }

  return response.text();
}

async function run() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error('Usage: node scripts/showOcrStages.js <path-to-pdf>');
    process.exit(1);
  }

  const resolvedPath = path.resolve(inputPath);
  if (!fs.existsSync(resolvedPath)) {
    console.error(`File not found: ${resolvedPath}`);
    process.exit(1);
  }

  const pdfBuffer = fs.readFileSync(resolvedPath);

  console.log('\n=== OCR PIPELINE VIEW ===');
  console.log(`File: ${path.basename(resolvedPath)}`);
  console.log(`Size: ${pdfBuffer.length.toLocaleString()} bytes`);

  // Stage 1: Raw PDF bytes before OCR/extraction.
  const binarySnippet = pdfBuffer.slice(0, 240).toString('latin1');
  console.log('\n[Raw PDF snippet]');
  console.log(toPrintableAscii(binarySnippet));

  // Stage 2: OCR output directly from Tika (intentionally uncleaned).
  const messyOcrText = await extractTextFromTika(pdfBuffer, { ocr: true });
  console.log('\n[Messy OCR text]');
  console.log(`Characters: ${messyOcrText.length}`);
  console.log(previewText(messyOcrText));

  // Stage 3: Cleaned text using the same normalization pattern as nlpProcessor.
  const cleanedText = cleanOcrText(messyOcrText);
  console.log('\n[Cleaned text]');
  console.log(`Characters: ${cleanedText.length}`);
  console.log(previewText(cleanedText));

  console.log('\n=== END ===\n');
}

run().catch((error) => {
  console.error(`\nError: ${error.message}`);
  console.error('Tip: Make sure the Tika server is running (npm run tika from repo root).');
  process.exit(1);
});
