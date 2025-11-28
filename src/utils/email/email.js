import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createTransport = () => {
  return nodemailer.createTransport({
   
    service: 'gmail',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

async function sendEmailWithTemplate({ to, subject, html, attachments = [] }) {
  const transporter = createTransport();
  
  const logoPath = path.join(__dirname, 'logo.jpg');
  const hasLogo = attachments.some(att => att.cid === 'logo');
  if (!hasLogo && fs.existsSync(logoPath)) {
    attachments.push({
      filename: 'logo.jpg',
      path: logoPath,
      cid: 'logo'
    });
  }
  
  const info = await transporter.sendMail({
    from: process.env.EMAIL || '"No Reply" <no-reply@example.com>',
    to,
    subject,
    html,
    attachments
  });
  return info;
}

async function sendResetEmail({ to, otp, expiryMinutes = 10 }) {
  const otpTemplatePath = path.join(__dirname, 'otp-template.html');
  
  let html = '';
  if (fs.existsSync(otpTemplatePath)) {
    html = fs.readFileSync(otpTemplatePath, 'utf-8');
    html = html.replace(/{{OTP_CODE}}/g, otp);
    html = html.replace(/{{EXPIRY_TIME}}/g, expiryMinutes.toString());
  } else {
    html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 2px solid #b2dfdb; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #00897b 0%, #00acc1 100%); padding: 30px 20px; text-align: center; border-bottom: 4px solid #00695c;">
          <img src="cid:logo" alt="Logo" style="max-width: 150px; height: auto; display: block; margin: 0 auto 15px;" />
          <h2 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h2>
        </div>
        <div style="padding: 40px 30px; text-align: center; color: #34495e;">
          <p style="font-size: 16px; line-height: 1.8;">Your OTP code is:</p>
          <div style="background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%); border: 3px solid #00897b; border-radius: 12px; padding: 30px; margin: 30px 0; display: inline-block;">
            <div style="font-size: 42px; font-weight: bold; color: #00695c; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
          </div>
          <p style="font-size: 14px; color: #7f8c8d;">This code will expire in ${expiryMinutes} minutes.</p>
        </div>
        <div style="background: linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%); padding: 20px; text-align: center; color: #004d40; font-size: 12px; border-top: 3px solid #00897b;">
          <p style="margin: 5px 0;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `;
  }
  
  return sendEmailWithTemplate({
    to,
    subject: 'Password Reset OTP - Health Care',
    html
  });
}

export { sendEmailWithTemplate, sendResetEmail };