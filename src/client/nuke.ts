import { sql } from "./sql";

export async function nukeDatabase() {
  await sql`DROP SCHEMA public CASCADE`;
  await sql`CREATE SCHEMA public`;
}
