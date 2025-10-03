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
exports.EmailHelper = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util_1 = require("util");
const handlebars_1 = __importDefault(require("handlebars"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const ReadFile = (0, util_1.promisify)(fs.readFile);
const sendEmail = (email, resetLink) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config_1.default.sender_email,
            pass: config_1.default.sender_app_password,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    yield transporter.sendMail({
        from: '"Warden" <h.r.sihab155@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'Password Reset Link', // Subject line.
        //text: "Hello world?", // plain text body
        html: `<html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Warden Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7f6;">
        <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f4f7f6;">
            <tr>
                <td style="padding: 20px 0; text-align: center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                            <td style="background-color: #0d9488; padding: 40px 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Warden</h1>
                                <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
                            </td>
                        </tr>
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 20px;">Hello, Traveler!</h2>
                                <p style="color: #555555; margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">We received a request to reset the password for your Warden account. Don't worry – it happens to the best of explorers!</p>
                                <p style="color: #555555; margin: 0 0 25px 0; font-size: 16px; line-height: 1.5;">To reset your password, click the button below. This link will expire in ${20} min.</p>
                                
                                <!-- Button -->
                                <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="border-radius: 4px; background-color: #0d9488;">
                                            <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none;">Reset Password</a>
                                        </td>
                                    </tr>
                                </table>
                                <p style="color: #555555; margin: 25px 0 0 0; font-size: 16px; line-height: 1.5;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f8fafa; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                                <p style="color: #999999; margin: 0; font-size: 14px;">Warden - Your Journey, Your Story</p>
                                <p style="color: #999999; margin: 10px 0 0 0; font-size: 12px;">This is an automated message, please do not reply.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>`,
    });
});
const sendOtpEmail = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: config_1.default.sender_email,
            pass: config_1.default.sender_app_password,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
    const html = `<div style="font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:24px; background:#fff; border-radius:8px;">
    <h2 style="color:#0d9488;">Warden — Verify your email</h2>
    <p>Hello,</p>
    <p>Your verification code is:</p>
    <p style="font-size:28px; font-weight:700; letter-spacing:4px;">${otp}</p>
    <p>This code will expire in 15 minutes. If you didn't request this, you can ignore this email.</p>
    <p style="color:#999; font-size:12px;">Warden</p>
  </div>`;
    yield transporter.sendMail({
        from: `"Warden" <${config_1.default.sender_email}>`,
        to: email,
        subject: 'Your Warden verification code',
        html,
    });
});
const createEmailContent = (data, templateType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path.join(process.cwd(), `src/views/${templateType}.template.hbs`);
        const content = yield ReadFile(templatePath, 'utf8');
        const template = handlebars_1.default.compile(content);
        return template(data);
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, error.message);
    }
});
exports.EmailHelper = {
    sendEmail,
    createEmailContent,
    sendOtpEmail,
};
