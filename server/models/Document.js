/**
 * Document Model
 * 
 * Stores information about uploaded financial documents (PDFs)
 * Each document is associated with a user and contains metadata
 * about the file including upload date for monthly organization
 */

import { DataTypes } from 'sequelize';
import { sequelize, User } from './User.js';

const Document = sequelize.define('Document', {
  // Unique identifier for the document
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  
  // Original filename as uploaded by user
  originalName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // Stored filename on server (unique)
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  
  // Full path to the file on server
  filePath: {
    type: DataTypes.STRING,
    allowNull: false
  },
  
  // File size in bytes
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  
  // User who uploaded the document
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  
  // Upload timestamp - used for monthly grouping
  uploadDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'documents',
  timestamps: true // Adds createdAt and updatedAt
});

// Define association between Document and User
Document.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Document, { foreignKey: 'userId' });

export default Document;
