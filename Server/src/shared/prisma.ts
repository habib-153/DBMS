/* eslint-disable no-console */
import { withAccelerate } from '@prisma/extension-accelerate';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

if (process.env.NODE_ENV === 'development') {
  prisma.$on(
    'query',
    (e: { query: string; params: string; duration: number }) => {
      console.log('-------------------------------------------');
      console.log('Query: ' + e.query);
      console.log('-------------------------------------------');
      console.log('Params: ' + e.params);
      console.log('-------------------------------------------');
      console.log('Duration: ' + e.duration + 'ms');
      console.log('-------------------------------------------');
    }
  );
}

const acceleratedPrisma = prisma.$extends(withAccelerate());

export default acceleratedPrisma;
