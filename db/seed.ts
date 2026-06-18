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

    if (!existing) {
      await db.insert(users).values({
        name: 'Admin Innovara',
        email: 'admin@hmpsti.ub.ac.id',
        password: 'password123', // For production this should be hashed
        role: 'admin',
      });
      console.log('Created initial admin user (admin@hmpsti.ub.ac.id / password123)');
    } else {
      console.log('Admin user already exists. Seed skipped.');
    }

    // Insert vote sessions if they don't exist
    const existingSessions = await db.query.vote_sessions.findMany();
    if (existingSessions.length === 0) {
      console.log('Seeding vote sessions...');
      await db.insert(schema.vote_sessions).values([
        {
          name: 'Sesi 1',
          startTime: new Date('2026-06-20T08:30:00Z'),
          endTime: new Date('2026-06-20T11:30:00Z'),
        },
        {
          name: 'Sesi 2',
          startTime: new Date('2026-06-20T12:00:00Z'),
          endTime: new Date('2026-06-20T15:00:00Z'),
        }
      ]);
      console.log('Successfully seeded vote sessions.');
    } else {
      console.log('Vote sessions already exist. Seed skipped.');
    }

    console.log('Seed successful!');
  } catch (error) {
    console.error('Seed failed:', error);
  }
}

main();
