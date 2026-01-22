import { createRequire } from 'module';
import natural from 'natural';
import fs from 'fs';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

const tokenizer = new natural.WordTokenizer();
const { LancasterStemmer } = natural;

const stopwords = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will', 'with'
]);

export async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const pdfData = await pdfParse(dataBuffer);
  return pdfData.text;
}

export function tokenizeText(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  return tokens.filter(token => /^[a-z]+$/.test(token) && token.length > 1);
}

export function removeStopwords(tokens) {
  return tokens.filter(token => !stopwords.has(token));
}

export function lemmatizeTokens(tokens) {
  return tokens.map(token => LancasterStemmer.stem(token));
}

export async function processDocument(filePath) {
  const rawText = await extractTextFromPDF(filePath);
  const tokens = tokenizeText(rawText);
  const filteredTokens = removeStopwords(tokens);
  const lemmatizedTokens = lemmatizeTokens(filteredTokens);
  
  const wordFrequency = {};
  lemmatizedTokens.forEach(token => {
    wordFrequency[token] = (wordFrequency[token] || 0) + 1;
  });
  
  const topWords = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => ({ word, count }));
  
  return { rawText, processedTokens: lemmatizedTokens, wordFrequency, topWords };
}

export default { processDocument };
