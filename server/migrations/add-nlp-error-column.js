/**
 * Migration: Add nlpError column to documents table
 * 
 * This migration adds a column to store error messages when NLP processing fails.
 */

import { sequelize } from '../models/User.js';

async function addNlpErrorColumn() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Adding nlpError column to documents table...');
    
    // Add the nlpError column
    await queryInterface.addColumn('documents', 'nlpError', {
      type: sequelize.Sequelize.TEXT,
      allowNull: true
    });
    
    console.log('Migration completed successfully!');
    console.log('Added column: nlpError (TEXT, nullable)');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
addNlpErrorColumn();
