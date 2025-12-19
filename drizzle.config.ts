
import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';
if (!process.env.CHAT_API_DATABASE_LOCAL_URL) {
  throw new Error("CHAT_API_DATABASE_LOCAL_URL is not set in .env");
}

export default defineConfig({
  schema: './models/schema.ts',
  out: './models/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.CHAT_API_DATABASE_LOCAL_URL!,
  },
});