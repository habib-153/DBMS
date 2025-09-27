"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
/* eslint-disable no-console */
const bcrypt = __importStar(require("bcryptjs"));
const config_1 = __importDefault(require("../config"));
const database_1 = __importDefault(require("../../shared/database"));
const seed = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if super admin already exists
        const existingAdminQuery = `
      SELECT id FROM users 
      WHERE role = 'SUPER_ADMIN' 
      LIMIT 1
    `;
        const existingAdmin = yield database_1.default.query(existingAdminQuery);
        if (existingAdmin.rows.length > 0) {
            console.log('Super admin already exists!');
            return;
        }
        const hashedPassword = yield bcrypt.hash(config_1.default.admin_password, Number(config_1.default.bcrypt_salt_rounds));
        // Create super admin user
        const insertAdminQuery = `
      INSERT INTO users (
        name, email, password, phone, profile_photo, 
        role, is_verified, need_password_change, status, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      ) RETURNING *
    `;
        const superAdminData = yield database_1.default.query(insertAdminQuery, [
            'Super Admin',
            config_1.default.admin_email,
            hashedPassword,
            config_1.default.admin_mobile_number,
            config_1.default.admin_profile_photo,
            'SUPER_ADMIN',
            true,
            false,
            'ACTIVE',
        ]);
        console.log('Super Admin Created Successfully!', superAdminData.rows[0]);
    }
    catch (err) {
        console.error('Error in seeding:', err);
    }
});
exports.seed = seed;
