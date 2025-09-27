/* eslint-disable no-console */
import * as bcrypt from 'bcryptjs';
import config from '../config';
import database from '../../shared/database';

export const seed = async () => {
  try {
    // Check if super admin already exists
    const existingAdminQuery = `
      SELECT id FROM users 
      WHERE role = 'SUPER_ADMIN' 
      LIMIT 1
    `;

    const existingAdmin = await database.query(existingAdminQuery);

    if (existingAdmin.rows.length > 0) {
      console.log('Super admin already exists!');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      config.admin_password as string,
      Number(config.bcrypt_salt_rounds)
    );

    // Create super admin user
    const insertAdminQuery = `
      INSERT INTO users (
        name, email, password, phone, profile_photo, 
        role, is_verified, need_password_change, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *
    `;

    const superAdminData = await database.query(insertAdminQuery, [
      'Super Admin',
      config.admin_email as string,
      hashedPassword,
      config.admin_mobile_number,
      config.admin_profile_photo,
      'SUPER_ADMIN',
      true,
      false,
      'ACTIVE',
    ]);

    console.log('Super Admin Created Successfully!', superAdminData.rows[0]);
  } catch (err) {
    console.error('Error in seeding:', err);
  }
};
