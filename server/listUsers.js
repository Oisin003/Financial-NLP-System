import { User, sequelize } from './models/User.js';

await sequelize.sync();
const users = await User.findAll({
  attributes: ['id', 'username', 'email', 'role', 'createdAt']
});

if (users.length === 0) {
  console.log('No users found in the database.');
} else {
  console.log(`Found ${users.length} user(s):\n`);
  users.forEach((u) => {
    console.log(`  ID:       ${u.id}`);
    console.log(`  Username: ${u.username}`);
    console.log(`  Email:    ${u.email}`);
    console.log(`  Role:     ${u.role}`);
    console.log(`  Created:  ${u.createdAt}`);
    console.log('  ---');
  });
}

await sequelize.close();
