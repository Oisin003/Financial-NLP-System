/**
 * User Model - Handles User Data and Password Security
 * 
 * This file creates the "Users" table in the database and defines how user data is stored.
 * 
 * Security Features:
 * - Passwords are hashed using bcrypt (10 salt rounds)
 * - Passwords are automatically hashed on user creation and updates
 * - Plain text passwords are never stored in the database
 */

import { Sequelize, DataTypes } from 'sequelize';  // Database ORM (Object-Relational Mapping)
import bcrypt from 'bcryptjs';  // Password encryption library
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ES module workaround to get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// --- DATABASE SETUP ---
// Create connection to SQLite database file
const databasePath = path.join(__dirname, '../database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',  // Using SQLite
  storage: databasePath,  // Store database in server folder
  logging: false  // Turn off SQL query logging
});

// --- USER TABLE DEFINITION ---
// Define the structure of the Users table
const User = sequelize.define('User', {
  // Unique ID for each user 
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true  
  },
  
  // Username: must be unique and 2-50 characters
  username: {
    type: DataTypes.STRING,
    allowNull: false,  // Required field
    unique: true,  // No two users can have the same username
    validate: {
      len: [2, 50]  // Must be between 2 and 50 characters
    }
  },
  
  // Email: must be unique and valid email format
  email: {
    type: DataTypes.STRING,
    allowNull: false,  // Required field
    unique: true,  // No two users can have the same email
    validate: {
      isEmail: true  // Must be a valid email format 
    }
  },
  
  // Password: will be automatically hashed before storage
  password: {
    type: DataTypes.STRING,
    allowNull: false  // Required field
  },
  
  // Role: either user or the admin
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',  // New users are regular 'user' by default
    validate: {
      isIn: [['user', 'admin']]  // Only these two values are allowed
    }
  }
}, {
  timestamps: true,  // Automatically add createdAt and updatedAt fields
  
  // --- PASSWORD HASHING HOOKS ---
  // These functions run automatically before saving to database
  hooks: {
    // Hash password when creating a new user
    beforeCreate: async (user) => {
      if (user.password) {
        // Maria Griffin taught this :)
        // Generate salt (random data to make hash unique)
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    
    // Hash password when updating a user (if password changed)
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// --- PASSWORD VERIFICATION METHOD ---
/**
 * Check if a provided password matches the stored hashed password
 * Used during login to verify credentials
 */
User.prototype.comparePassword = async function(candidatePassword) {
  const storedPassword = this.password;
  return await bcrypt.compare(candidatePassword, storedPassword);
};

// Export User model and database connection
export { User, sequelize };
