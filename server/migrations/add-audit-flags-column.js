/**
 * Migration Script: Add auditFlags column
 *
 * Run this script once to add the new column to the documents table:
 * node server/migrations/add-audit-flags-column.js
 */

import { sequelize } from '../models/User.js';

async function migrate() {
  try {
    console.log('Starting migration: Adding auditFlags column...');

    await sequelize.query(
      'ALTER TABLE documents ADD COLUMN auditFlags TEXT;'
    );
    console.log('✓ Added auditFlags column');

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('⚠ Column already exists. Migration skipped.');
      process.exit(0);
    } else {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  }
}

migrate();
