/**
 * Admin User Creator Script
 * 
 * This is a simple utility script to create an admin user in the database.
 * Run this once when setting up the system for the first time.
 * 
 * How to run:
 *   node createAdmin.js
 * 
 * What it does:
 * 1. Connects to the database
 * 2. Checks if an admin user already exists
 * 3. If not, creates a new admin user with default credentials
 * 4. Prints the login details to the console
 */

// Import required packages
import dotenv from 'dotenv';  // Load environment variables
import { User, sequelize } from './models/User.js';  // Database models

// Load environment variables
dotenv.config();

/**
 * Main function to create admin user
 */
const createAdmin = async () => {
  try {
    // Step 1: Connect to the database
    await sequelize.sync();
    console.log('Connected to the database');

    // Step 2: Check if an admin user already exists
    const existingAdmin = await User.findOne({ 
      where: { role: 'admin' } 
    });
    
    // If admin exists, show their details and exit
    if (existingAdmin) {
      console.log('\n Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      console.log('\nNo new admin user created.');
      process.exit(0);  // Exit successfully
    }

    // Step 3: Create a new admin user with default credentials
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@achilles.com',
      password: 'Admin@123',  // Password will be automatically hashed by the User model
      role: 'admin'
    });

    // Step 4: Display the login credentials
    console.log('\n Admin user created successfully!');
    console.log('=================================');
    console.log('Email:    admin@achilles.com');
    console.log('Password: Admin@123');
    console.log('=================================');
    
    process.exit(0);  // Exit successfully
    
  } catch (error) {
    // If anything goes wrong, show the error
    console.error('\nERROR: Creating admin user failed:', error.message);
    process.exit(1);  // Exit with error code
  }
};

// Run the function
createAdmin();
