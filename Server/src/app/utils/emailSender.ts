import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import config from '../config';
import AppError from '../errors/AppError';
import httpStatus from 'http-status';

const ReadFile = promisify(fs.readFile);

const sendEmail = async (email: string, resetLink: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: config.sender_email,
      pass: config.sender_app_password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
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
};

const createEmailContent = async (data: object, templateType: string) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      `src/views/${templateType}.template.hbs`
    );
    const content = await ReadFile(templatePath, 'utf8');

    const template = Handlebars.compile(content);

    return template(data);
  } catch (error) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      (error as Error).message
    );
  }
};

export const EmailHelper = {
  sendEmail,
  createEmailContent,
};
