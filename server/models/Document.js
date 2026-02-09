/**
 * Document Model - Stores Information About Uploaded PDF Files
 * 
 * This file creates the "Documents" table in the database.
 * Each row represents one uploaded PDF document.
 */

import { DataTypes } from 'sequelize';
import { sequelize, User } from './User.js';

// --- DOCUMENT TABLE DEFINITION ---
const Document = sequelize.define('Document', {
    // Financial figures extracted by NLP microservice (array of objects)
    financialFigures: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('financialFigures');
        if (!value) return [];
        return JSON.parse(value);
      },
      set(value) {
        this.setDataValue('financialFigures', JSON.stringify(value));
      }
    },

    // Named entities extracted by NLP microservice (array of objects)
    nlpEntities: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('nlpEntities');
        if (!value) return [];
        return JSON.parse(value);
      },
      set(value) {
        this.setDataValue('nlpEntities', JSON.stringify(value));
      }
    },

    // Audit-style flags derived from extracted text (array of objects)
    auditFlags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('auditFlags');
        if (!value) return [];
        return JSON.parse(value);
      },
      set(value) {
        this.setDataValue('auditFlags', JSON.stringify(value));
      }
    },
  
  // Unique ID for each document 
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Original filename when user uploaded it 
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Unique filename stored on server 
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true  // No two files can have the same stored filename
  },
  
  // Full path to file on server 
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // File size in bytes 
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
  
  // When the document was uploaded 
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
  
  // Processed tokens
  // Stored as JSON array
  processedTokens: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript array (code)
    get() {
      const value = this.getDataValue('processedTokens');
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    },
    set(value) {
      this.setDataValue('processedTokens', JSON.stringify(value));
    }
  },
  
  // Word frequency data 
  // Stored as JSON object: 
  wordFrequency: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript object (code)
    get() {
      const value = this.getDataValue('wordFrequency');
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    },
    set(value) {
      this.setDataValue('wordFrequency', JSON.stringify(value));
    }
  },
  
  // Top 20 most common words
  // Stored as JSON array
  topWords: {
    type: DataTypes.TEXT,
    allowNull: true,
    // Automatically convert between JSON string (database) and JavaScript object (code)
    get() {
      const value = this.getDataValue('topWords');
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    },
    set(value) {
      this.setDataValue('topWords', JSON.stringify(value));
    }
  },
  
  // Flag to indicate if NLP processing has been completed
  nlpProcessed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false  // Starts as false, set to true after NLP processing
  },

  // NLP Processing Timing Information
  nlpProcessingStartTime: {
    type: DataTypes.DATE,
    allowNull: true  // When NLP processing started
  },

  nlpProcessingEndTime: {
    type: DataTypes.DATE,
    allowNull: true  // When NLP processing completed
  },

  nlpProcessingDuration: {
    type: DataTypes.FLOAT,
    allowNull: true  // Processing duration in seconds
  },

  // NLP Processing Error Message (if processing failed)
  nlpError: {
    type: DataTypes.TEXT,
    allowNull: true  // Error message for failed processing, null if successful
  }
}, {
  tableName: 'documents',
  timestamps: true  // Automatically add createdAt and updatedAt fields
});


// --- DATABASE RELATIONSHIPS ---
// Paul Corey's Database Model came in handy here :)

// A Document belongs to one User 
Document.belongsTo(User, { foreignKey: 'userId' });

// A User can have many Documents
User.hasMany(Document, { foreignKey: 'userId' });

export default Document;
