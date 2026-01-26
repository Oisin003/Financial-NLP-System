/**
 * Document Model - Stores Information About Uploaded PDF Files
 * 
 * This file creates the "Documents" table in the database.
 * Each row represents one uploaded PDF document.
 * 
 * What it stores:
 * - File information (name, path, size)
 * - Who uploaded it (userId)
 * - When it was uploaded (uploadDate)
 * - NLP analysis results (extracted text, keywords, word frequencies)
 * 
 * The NLP data is stored as JSON strings in the database
 * and automatically converted to JavaScript objects when you read them.
 */

import { DataTypes } from 'sequelize';
import { sequelize, User } from './User.js';

// --- DOCUMENT TABLE DEFINITION ---
const Document = sequelize.define('Document', {
  
  // Unique ID for each document (automatically generated)
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Original filename when user uploaded it (e.g., "Financial_Report_2024.pdf")
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Unique filename stored on server (prevents name conflicts)
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true  // No two files can have the same stored filename
  },
  
  // Full path to file on server (e.g., "/uploads/documents/abc123.pdf")
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // File size in bytes (for display and storage management)
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  // ID of the user who uploaded this document
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',  // Links to the Users table
      key: 'id'
    }
  },
  
  // When the document was uploaded (used for monthly grouping in UI)
  uploadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW  // Automatically set to current time
  },

  // When the document should be deleted (6 months after upload) May change depending on what Helix says
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  // --- NLP PROCESSING RESULTS ---
  
  // Raw text extracted from the PDF
  extractedText: {
    type: DataTypes.TEXT,  // TEXT allows for large amounts of text
    allowNull: true  // Optional - only filled after NLP processing
  },
  
  // Processed tokens (cleaned words from the document)
  // Stored as JSON array: ["finance", "report", "revenue", ...]
  processedTokens: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript array (code)
    get() {
      const value = this.getDataValue('processedTokens');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('processedTokens', JSON.stringify(value));
    }
  },
  
  // Word frequency data (how many times each word appears)
  // Stored as JSON object: {"finance": 45, "report": 23, "revenue": 18, ...}
  wordFrequency: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript object (code)
    get() {
      const value = this.getDataValue('wordFrequency');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('wordFrequency', JSON.stringify(value));
    }
  },
  
  // Top 20 most common words
  // Stored as JSON array: [{word: "finance", count: 45}, {word: "report", count: 23}, ...]
  topWords: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript object (code)
    get() {
      const value = this.getDataValue('topWords');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('topWords', JSON.stringify(value));
    }
  },
  
  // Flag to indicate if NLP processing has been completed
  nlpProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // Starts as false, set to true after NLP processing
  }
}, {
  tableName: 'documents',
  timestamps: true  // Automatically add createdAt and updatedAt fields
});


// --- DATABASE RELATIONSHIPS ---
// A Document belongs to one User (the uploader)
Document.belongsTo(User, { foreignKey: 'userId' });

// A User can have many Documents
User.hasMany(Document, { foreignKey: 'userId' });

export default Document;
