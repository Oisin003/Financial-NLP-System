import dotenv from 'dotenv';
import { User, sequelize } from './models/User.js';

dotenv.config();

// Create admin user
const createAdmin = async () => {
  try {
    // Sync database
    await sequelize.sync();
    console.log('Connected to SQLite database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Username:', existingAdmin.username);
      process.exit(0);
    }

    // Create new admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@achilles.com',
      password: 'Admin@123',  // Note to self: Change this password after first login
      role: 'admin'
    });

    console.log('\n✓ Admin user created');
    console.log('=================================');
    console.log('Email: admin@achilles.com');
    console.log('Password: Admin@123');
    console.log('=================================');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
