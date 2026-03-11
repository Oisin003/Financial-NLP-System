import { jest } from '@jest/globals';

// Mock base NLP processor so this test does not depend on Tika/PDF parsing.
const processDocumentMock = jest.fn();
// Mock microservice call so we can force a failure scenario.
const getFullNLPAnalysisMock = jest.fn();

jest.unstable_mockModule('../services/nlpProcessor.js', () => ({
  processDocument: processDocumentMock
}));

jest.unstable_mockModule('../services/nlpMicroservice.js', () => ({
  getFullNLPAnalysis: getFullNLPAnalysisMock
}));

const { processDocumentNLP } = await import('../routes/documents/nlpProcessing.js');

describe('NLP processing fallback behavior', () => {
  test('marks document as processed even when microservice fails', async () => {
    // Base processor succeeds with core NLP data.
    processDocumentMock.mockResolvedValueOnce({
      rawText: 'Turnover 500000',
      processedTokens: ['turnover', '500000'],
      wordFrequency: { turnover: 1 },
      topWords: [{ word: 'turnover', count: 1 }],
      auditFlags: [{ id: 'rag-status', severity: 'low' }]
    });

    // Microservice fails (e.g. timeout/down service).
    getFullNLPAnalysisMock.mockRejectedValueOnce(new Error('Service unavailable'));

    const updateMock = jest.fn().mockResolvedValue(undefined);
    const fakeDocument = {
      id: 123,
      filePath: 'uploads/documents/fake.pdf',
      update: updateMock
    };

    await processDocumentNLP(fakeDocument);

    // First update call sets processing start status.
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        nlpProcessed: false,
        nlpError: null
      })
    );

    // Final update call should still complete with defaults for microservice fields.
    const finalPayload = updateMock.mock.calls[1][0];
    expect(finalPayload.nlpProcessed).toBe(true);
    expect(finalPayload.nlpSummary).toBeNull();
    expect(finalPayload.financialFigures).toEqual([]);
    expect(finalPayload.nlpEntities).toEqual([]);
    expect(finalPayload.extractedText).toBe('Turnover 500000');
  });
});
