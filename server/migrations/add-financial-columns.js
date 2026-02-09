/**
 * Migration Script: Add financialFigures and nlpEntities columns
 * 
 * Run this script once to add the new columns to the documents table:
 * node server/migrations/add-financial-columns.js
 */

import { sequelize } from '../models/User.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding financialFigures and nlpEntities columns...');
    
    // Add financialFigures column
    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN financialFigures TEXT;'
    );
    console.log(' Added financialFigures column');
    
    // Add nlpEntities column
    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN nlpEntities TEXT;'
    );
    console.log('Added nlpEntities column');
    
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
