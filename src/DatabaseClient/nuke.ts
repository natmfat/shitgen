import { sql } from "./client";

async function nukeDatabase() {
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
}

// who needs database migrations???
await nukeDatabase();
process.exit(0);
