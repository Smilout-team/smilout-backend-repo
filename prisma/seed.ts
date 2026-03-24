import 'dotenv/config';
import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const STORE_UPDATES = [
  {
    findName: 'Family Grocery Đà Nẵng',
    data: {
      storeName: 'Family Grocery Mart',
      address: '20 Lê Văn Hiến, Ngũ Hành Sơn, Đà Nẵng',
      coordinate: '16.0186965,108.2481167',
    },
  },
  {
    findName: 'Smilout Thanh Khê',
    data: {
      storeName: 'Smilout Hải Châu',
      address: '139 Nguyễn Văn Linh, Phước Ninh, Hải Châu, Đà Nẵng',
      coordinate: '16.0601976,108.2108978',
    },
  },
  {
    findName: 'Eco Mart Liên Chiểu',
    data: {
      storeName: 'Eco Mart Hải Châu',
      address: '73 Nguyễn Hữu Thọ, Hòa Thuận Nam, Hải Châu, Đà Nẵng',
      coordinate: '16.0539072,108.204461',
    },
  },
  {
    findName: 'Smilout Hòa Xuân',
    data: {
      storeName: 'Smilout Sơn Trà',
      address: '72 Nguyễn Trọng Nghĩa, Mân Thái, Sơn Trà, Đà Nẵng',
      coordinate: '16.0862568,108.2443451',
    },
  },
];

async function updateStores() {
  console.log('Updating stores...');

  for (const store of STORE_UPDATES) {
    const existed = await prisma.store.findFirst({
      where: { storeName: store.findName },
    });

    if (!existed) {
      console.log(`Not found: ${store.findName}`);
      continue;
    }

    await prisma.store.update({
      where: { id: existed.id },
      data: store.data,
    });

    console.log(`Updated: ${store.findName} → ${store.data.storeName}`);
  }

  console.log('\nDONE update stores');
}

updateStores()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
