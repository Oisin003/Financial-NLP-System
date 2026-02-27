import { processDocument } from '../../services/nlpProcessor.js';
import { getFullNLPAnalysis } from '../../services/nlpMicroservice.js';

/**
 * Run full NLP processing in the background for one document.
 * This keeps upload and reprocess endpoints fast while work happens async.
 */
export async function processDocumentNLP(document) {
  const startTime = new Date();

  try {
    console.log(`Processing document ${document.id} with our patented NLP technique...`);

    await document.update({
      nlpProcessingStartTime: startTime,
      nlpProcessed: false,
      nlpError: null
    });

    const nlpResults = await processDocument(document.filePath);

    let microserviceResults = {};
    try {
      microserviceResults = await getFullNLPAnalysis(nlpResults.rawText);
    } catch (err) {
      console.error('Python NLP microservice /analyze error:', err.message);
    }

    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationSeconds = (durationMs / 1000).toFixed(3);

    await document.update({
      extractedText: nlpResults.rawText,
      nlpSummary: microserviceResults.summary || null,
      nlpSummaryEvaluation: microserviceResults.summary_evaluation || null,
      nlpDecisionTrace: microserviceResults.decision_trace || null,
      processedTokens: nlpResults.processedTokens,
      wordFrequency: nlpResults.wordFrequency,
      topWords: nlpResults.topWords,
      auditFlags: nlpResults.auditFlags || [],
      financialFigures: microserviceResults.financial_figures || [],
      nlpEntities: microserviceResults.entities || [],
      nlpProcessingEndTime: endTime,
      nlpProcessingDuration: parseFloat(durationSeconds),
      nlpProcessed: true
    });

    console.log(`Document ${document.id} processed successfully in ${durationSeconds}s`);
  } catch (error) {
    console.error(`NLP processing failed for document ${document.id}:`, error.message);

    const endTime = new Date();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(3);

    await document.update({
      nlpProcessingEndTime: endTime,
      nlpProcessingDuration: parseFloat(durationSeconds),
      nlpProcessed: false,
      nlpError: error.message
    }).catch(err => console.error('Failed to update timing on error:', err));
  }
}
