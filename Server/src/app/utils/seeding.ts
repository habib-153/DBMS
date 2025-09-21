import { UserRole } from '@prisma/client';
import prisma from '../../shared/prisma';
import * as bcrypt from 'bcryptjs';
import config from '../config';

export const seed = async () => {
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

    const hashedPassword = await bcrypt.hash(
      config.admin_password as string,
      Number(config.bcrypt_salt_rounds)
    );

    const superAdminData = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: config.admin_email as string,
        password: hashedPassword,
        phone: config.admin_mobile_number,
        profilePhoto: config.admin_profile_photo,
        role: UserRole.SUPER_ADMIN,
        isVerified: true,
        needPasswordChange: false,
      },
    });

    console.log('Super Admin Created Successfully!', superAdminData);
  } catch (err) {
    console.error('Error in seeding:', err);
  }
};
