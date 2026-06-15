/**
 * Prisma CLI configuration file.
 * Provides the schema path and datasource URL to Prisma CLI commands
 * (e.g. prisma migrate, prisma generate) at runtime, allowing the
 * DATABASE_URL to be resolved from environment variables via dotenv.
 */
/// <reference types="node" />
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL,
  },
});

