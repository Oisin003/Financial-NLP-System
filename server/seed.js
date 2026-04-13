/**
 * Database Seed Script
 *
 * Creates default users on first startup.
 * Safe to call every time the server starts — skips any user that already exists.
 * This was primarly done for testing purposes - and because I could never remember my password
 *
 * Default accounts created:
 *   Admin  | admin@achilles.com | Admin@123
 *   Demo   | demo@achilles.com  | Demo@123
 *
 * To add more default users, add entries to the SEED_USERS array below.
 */

import { Op } from 'sequelize';
import { User } from './models/User.js';

// Default users that every fresh installation should have
const SEED_USERS = [
  {
    username: 'admin',
    email: 'admin@achilles.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    username: 'demo',
    email: 'demo@achilles.com',
    password: 'Demo@123',
    role: 'user'
  }
];

export async function seedDatabase() {
  let created = 0;

  for (const userData of SEED_USERS) {
    // Skip if email OR username is already taken
    const existing = await User.findOne({
      where: { [Op.or]: [{ email: userData.email }, { username: userData.username }] }
    });
    if (existing) continue;

    await User.create(userData); // password hashing happens in the User model's beforeCreate hook
    created++;
    console.log(`Seeded user: ${userData.email} (${userData.role})`);
  }

  if (created === 0) {
    console.log('Seed: all default users already exist, nothing to do');
  } else {
    console.log(`Seed complete — ${created} user(s) created`);
  }
}
