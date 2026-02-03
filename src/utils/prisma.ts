import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { createRequire } from 'node:module';
import { config } from '../config/index.js';
import { Pool } from 'pg';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('../../generated/prisma/client.js');

const connectionString = `${process.env.DATABASE_URL}`;
const cert = config.digitalOcean.dbCert;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: true,
    ca: cert,
  },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
  ],
});

prisma.$on('query', (e: any) => {
  console.log('Query: ' + e.query);
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

export { prisma };
