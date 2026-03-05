import React from 'react';
import { styles } from './NLPAnalysis.styles';

// Shows named entities (people, organizations, dates, etc.) grouped by type.
function NLPAnalysisEntitiesSection({ entities }) {
  // Nothing to show if entities are missing or empty.
  if (!Array.isArray(entities) || entities.length === 0) {
    return null;
  }

  // Group entities by label and remove duplicates with Set.
  const entityGroups = {};
  entities.forEach((entity) => {
    const label = entity.label;
    const value = entity.text;

    if (!entityGroups[label]) {
      entityGroups[label] = new Set();
    }

    entityGroups[label].add(value);
  });

  // Friendlier names for NLP labels.
  const typeDescriptions = {
    ORG: 'Organizations & Companies',
    PERSON: 'People & Names',
    GPE: 'Countries, Cities & States',
    LOC: 'Locations & Places',
    DATE: 'Dates & Time Periods',
    CARDINAL: 'Numbers & Quantities',
    PERCENT: 'Percentages',
    PRODUCT: 'Products & Services',
    EVENT: 'Events',
    LAW: 'Laws & Regulations',
    NORP: 'Nationalities & Groups',
    FAC: 'Facilities & Buildings',
    WORK_OF_ART: 'Works of Art',
    LANGUAGE: 'Languages',
    ORDINAL: 'Ordinal Numbers',
    TIME: 'Times',
    QUANTITY: 'Quantities'
  };

  // Left border color per entity type (fallback to gray if unknown).
  const borderColors = {
    ORG: '#1565c0',
    PERSON: '#c2185b',
    GPE: '#2e7d32',
    LOC: '#3949ab',
    DATE: '#ef6c00',
    CARDINAL: '#7b1fa2',
    PERCENT: '#00838f',
    PRODUCT: '#d84315',
    EVENT: '#ff8f00',
    LAW: '#5d4037'
  };

  // Show the biggest groups first.
  const sortedTypes = Object.keys(entityGroups).sort((a, b) => entityGroups[b].size - entityGroups[a].size);

  return (
    <div style={styles.section}>
      <h3>
        <i className="bi bi-tags-fill me-2"></i>
        Named Entities
      </h3>
      <p style={styles.description}>
        Key entities extracted from the document, grouped by category
      </p>
      <div style={styles.entitiesContainer}>
        {sortedTypes.map((entityType) => {
          const uniqueEntities = Array.from(entityGroups[entityType]);
          const colorStyle = styles[`entityTag${entityType}`] || styles.entityTagDefault;

          return (
            <div
              key={entityType}
              style={{
                ...styles.entityTypeGroup,
                borderLeftColor: borderColors[entityType] || '#6c757d'
              }}
            >
              <div style={styles.entityTypeHeader}>
                <span style={styles.entityTypeLabel}>{typeDescriptions[entityType] || entityType}</span>
                <span
                  style={{
                    ...styles.entityTypeCount,
                    background: borderColors[entityType] || '#6c757d'
                  }}
                >
                  {uniqueEntities.length}
                </span>
              </div>

              <div style={styles.entityTagsContainer}>
                {uniqueEntities.slice(0, 20).map((text, idx) => (
                  <span key={idx} style={{ ...styles.entityTag, ...colorStyle }} title={`Type: ${entityType}`}>
                    {text}
                  </span>
                ))}
                {uniqueEntities.length > 20 && (
                  <span style={{ ...styles.entityTag, ...styles.entityTagDefault }}>
                    +{uniqueEntities.length - 20} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default NLPAnalysisEntitiesSection;
