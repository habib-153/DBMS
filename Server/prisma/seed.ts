import { UserRole } from '@prisma/client';
import prisma from '../src/shared/prisma';
import * as bcrypt from 'bcryptjs';

const seedSuperAdmin = async () => {
  try {
    const isExistSuperAdmin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (isExistSuperAdmin) {
      console.log('Super admin already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash('superadmin', 12);

    const superAdminData = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'super@admin.com',
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
        needPasswordChange: false,
      },
    });

    console.log('Super Admin Created Successfully!', superAdminData);
  } catch (err) {
    console.error(err);
  }
};

const main = async () => {
  await seedSuperAdmin();
};

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
