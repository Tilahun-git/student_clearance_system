// prisma/prisma.config.ts
export const config = {
  adapter: process.env.DATABASE_URL, // PostgreSQL URL
};