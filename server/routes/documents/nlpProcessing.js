import { processDocument } from '../../services/nlpProcessor.js';
import { getFullNLPAnalysis } from '../../services/nlpMicroservice.js';

/**
 * Run full NLP processing in the background for one document.
 * This keeps upload and reprocess endpoints fast while work happens async.
 */
export async function processDocumentNLP(document) {
  // Record when processing starts.
  const startTime = new Date();

  try {
    // Step 1: log that processing has started.
    console.log(`Processing document ${document.id} with our patented NLP technique...`);

    // Step 2: reset document processing status.
    await document.update({
      nlpProcessingStartTime: startTime,
      nlpProcessed: false,
      nlpError: null
    });

    // Step 3: run base NLP pipeline.
    const nlpResults = await processDocument(document.filePath);

    // Step 4: call Python microservice for advanced analysis.
    let microserviceResults = {};
    try {
      microserviceResults = await getFullNLPAnalysis(nlpResults.rawText);
    } catch (err) {
      console.error('Python NLP microservice /analyze error:', err.message);
    }

    // Step 5: compute processing time.
    const endTime = new Date();
    const durationMs = endTime - startTime;
    const durationSeconds = (durationMs / 1000).toFixed(3);
    const durationAsNumber = parseFloat(durationSeconds);

    // Step 6: prepare full update payload.
    const updatePayload = {
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
      nlpProcessingDuration: durationAsNumber,
      nlpProcessed: true
    };

    // Step 7: save the full analysis result.
    await document.update(updatePayload);

    // Step 8: log completion.
    console.log(`Document ${document.id} processed successfully in ${durationSeconds}s`);
  } catch (error) {
    // If anything fails, store failure details for troubleshooting.
    console.error(`NLP processing failed for document ${document.id}:`, error.message);

    const endTime = new Date();
    const durationSeconds = ((endTime - startTime) / 1000).toFixed(3);
    const durationAsNumber = parseFloat(durationSeconds);

    const errorPayload = {
      nlpProcessingEndTime: endTime,
      nlpProcessingDuration: durationAsNumber,
      nlpProcessed: false,
      nlpError: error.message
    };

    await document
      .update(errorPayload)
      .catch(err => console.error('Failed to update timing on error:', err));
  }
}
