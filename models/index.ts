import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.ts';

// Ensure the environment variable is defined
if (!process.env.CHAT_API_DATABASE_LOCAL_URL) {
  throw new Error('CHAT_API_DATABASE_LOCAL_URL is not set in .env');
}

// Initialize postgres-js client
const client = postgres(process.env.CHAT_API_DATABASE_LOCAL_URL);
console.log("Database connected to ",process.env.CHAT_API_DATABASE_LOCAL_URL);
// Initialize Drizzle ORM with schema and logging
export  default drizzle(client, { schema, logger: true });