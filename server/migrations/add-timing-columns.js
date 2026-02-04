/**
 * Migration Script: Add NLP processing timing columns
 * 
 * Run this script once to add timing tracking to the documents table:
 * node server/migrations/add-timing-columns.js
 */

import { sequelize } from '../models/User.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding NLP timing columns...');
    
    // Add nlpProcessingStartTime column
    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN nlpProcessingStartTime TEXT;'
    );
    console.log('✓ Added nlpProcessingStartTime column');
    
    // Add nlpProcessingEndTime column
    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN nlpProcessingEndTime TEXT;'
    );
    console.log('✓ Added nlpProcessingEndTime column');
    
    // Add nlpProcessingDuration column
    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN nlpProcessingDuration REAL;'
    );
    console.log('Added nlpProcessingDuration column');
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Columns already exist. Migration skipped.');
      process.exit(0);
    } else {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  }
}

migrate();
