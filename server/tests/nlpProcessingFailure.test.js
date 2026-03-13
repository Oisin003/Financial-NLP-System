import { jest } from '@jest/globals';

// ---------------------------------------------------------------------------
// Test Setup: Mocking Dependencies
// ---------------------------------------------------------------------------

// Mock the base NLP processor so this test does not depend on real PDF parsing
// or Apache Tika. This isolates the test to *only* the fallback logic.
const processDocumentMock = jest.fn();

// Mock the external NLP microservice call. We want to simulate a failure
// scenario (e.g., timeout, network error, service down) to ensure the fallback
// logic still marks the document as processed.
const getFullNLPAnalysisMock = jest.fn();

// Replace the real module implementations with our mocks.
jest.unstable_mockModule('../services/nlpProcessor.js', () => ({
  processDocument: processDocumentMock
}));

jest.unstable_mockModule('../services/nlpMicroservice.js', () => ({
  getFullNLPAnalysis: getFullNLPAnalysisMock
}));

// Import the function under test *after* mocks are registered.
const { processDocumentNLP } = await import('../routes/documents/nlpProcessing.js');

// ---------------------------------------------------------------------------
// Test Suite: NLP Processing Fallback Behavior
// ---------------------------------------------------------------------------

describe('NLP processing fallback behavior', () => {
  test('marks document as processed even when microservice fails', async () => {
    // -----------------------------------------------------------------------
    // Arrange: Configure mock behavior
    // -----------------------------------------------------------------------

    // Simulate successful base NLP extraction (raw text, tokens, flags, etc.).
    // This represents the "minimum viable NLP" that should always succeed.
    processDocumentMock.mockResolvedValueOnce({
      rawText: 'Turnover 500000',
      processedTokens: ['turnover', '500000'],
      wordFrequency: { turnover: 1 },
      topWords: [{ word: 'turnover', count: 1 }],
      auditFlags: [{ id: 'rag-status', severity: 'low' }]
    });

    // Simulate the microservice failing (e.g., timeout or service unavailable).
    // The fallback logic should catch this and still complete processing.
    getFullNLPAnalysisMock.mockRejectedValueOnce(new Error('Service unavailable'));

    // Mock the Sequelize model's update() method. We track calls to ensure
    // the correct fields are written at each stage of processing.
    const updateMock = jest.fn().mockResolvedValue(undefined);

    // Fake document instance passed into the route handler.
    const fakeDocument = {
      id: 123,
      filePath: 'uploads/documents/fake.pdf',
      update: updateMock
    };

    // -----------------------------------------------------------------------
    // Act: Run the NLP processing pipeline
    // -----------------------------------------------------------------------
    await processDocumentNLP(fakeDocument);

    // -----------------------------------------------------------------------
    // Assert: Validate update calls and fallback behavior
    // -----------------------------------------------------------------------

    // The first update call should mark the document as "processing started".
    // At this point, no errors have occurred.
    expect(updateMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        nlpProcessed: false,
        nlpError: null
      })
    );

    // The second (final) update call should mark the document as fully processed,
    // even though the microservice failed. Fallback defaults should be applied.
    const finalPayload = updateMock.mock.calls[1][0];

    // Document should still be marked as processed.
    expect(finalPayload.nlpProcessed).toBe(true);

    // Microservice-derived fields should fall back to safe defaults.
    expect(finalPayload.nlpSummary).toBeNull();
    expect(finalPayload.financialFigures).toEqual([]);
    expect(finalPayload.nlpEntities).toEqual([]);

    // Base processor output should still be saved.
    expect(finalPayload.extractedText).toBe('Turnover 500000');
  });
});
