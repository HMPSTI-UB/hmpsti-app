import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from './schema';
import * as schema from './schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function main() {
  console.log('Seeding initial admin user...');
  
  try {
    // Check if user already exists
    const existing = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, 'admin@hmpsti.ub.ac.id')
    });

    if (existing) {
        console.log('Admin user already exists. Seed skipped.');
        return;
    }

    await db.insert(users).values({
      name: 'Admin Innovara',
      email: 'admin@hmpsti.ub.ac.id',
      password: 'password123', // For production this should be hashed
      role: 'admin',
    });

    console.log('Seed successful: Created initial admin user (admin@hmpsti.ub.ac.id / password123)');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

main();
