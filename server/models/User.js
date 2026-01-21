/**
 * User Model - Database Schema and Password Hashing
 * 
 * Defines the User table structure using Sequelize ORM:
 * - id: Auto-incrementing primary key
 * - username: Unique, 3-255 characters
 * - email: Unique, must be valid email format
 * - password: Hashed with bcrypt before storage
 * - role: Either 'user' or 'admin'
 * - timestamps: Automatically tracks createdAt and updatedAt
 * 
 * Security Features:
 * - Passwords are automatically hashed before saving (10 salt rounds)
 * - comparePassword method for login authentication
 * - Never returns plain text passwords
 */

import { Sequelize, DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module workaround to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize SQLite database connection
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'), // Store database file in server folder
  logging: false // Disable SQL query logging
});

// Define User model with all fields and validation rules
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 255] // Must be 3-255 characters
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true // Must be valid email format
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user', // New users are 'user' by default
    validate: {
      isIn: [['user', 'admin']] // Only allow these two roles
    }
  }
}, {
  timestamps: true, // Automatically add createdAt and updatedAt fields
  hooks: {
    // Automatically hash password before creating new user
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Automatically hash password if it's being updated
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Method to verify password during login
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export { User, sequelize };
