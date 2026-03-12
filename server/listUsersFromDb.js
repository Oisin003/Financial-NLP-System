import { Sequelize, DataTypes } from 'sequelize';

const dbPath = process.argv[2];
if (!dbPath) {
  console.error('Usage: node listUsersFromDb.js <path-to-database.sqlite>');
  process.exit(1);
}

const sequelize = new Sequelize({ dialect: 'sqlite', storage: dbPath, logging: false });

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  role: DataTypes.STRING,
  password: DataTypes.STRING,
}, { timestamps: true });

await sequelize.sync();
const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'createdAt'] });

if (users.length === 0) {
  console.log('No users found.');
} else {
  console.log(`Found ${users.length} user(s):\n`);
  users.forEach(u => {
    console.log(`  ID:       ${u.id}`);
    console.log(`  Username: ${u.username}`);
    console.log(`  Email:    ${u.email}`);
    console.log(`  Role:     ${u.role}`);
    console.log(`  Created:  ${u.createdAt}`);
    console.log('  ---');
  });
}

await sequelize.close();
