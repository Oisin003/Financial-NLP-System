import React from 'react';
import NLPAnalysisOverviewSection from './NLPAnalysisOverviewSection';
import NLPAnalysisEntitiesSection from './NLPAnalysisEntitiesSection';
import NLPAnalysisDocumentSections from './NLPAnalysisDocumentSections';

// Composes all non-audit content areas.
// Sub-sections are split into dedicated files to keep each concern isolated.
function NLPAnalysisContentSections({ nlpData, stats, summaryText, financialFigures }) {
  return (
    <>
      <NLPAnalysisOverviewSection
        nlpData={nlpData}
        stats={stats}
        summaryText={summaryText}
        financialFigures={financialFigures}
      />

      <NLPAnalysisEntitiesSection entities={nlpData.entities} />

      <NLPAnalysisDocumentSections nlpData={nlpData} />
    </>
  );
}

export default NLPAnalysisContentSections;
