import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log("Running migrations programmatically...");
  await migrate(db, { migrationsFolder: "db/migrations" });
  console.log("Migrations complete");
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error("Migration failed");
  console.error(err);
  await pool.end().catch(() => {});
  process.exit(1);
});