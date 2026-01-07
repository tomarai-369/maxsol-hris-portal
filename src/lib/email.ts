import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.FROM_EMAIL || 'hr@maximumsolutions.com.ph';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function sendActivationEmail(
  to: string,
  firstName: string,
  token: string
): Promise<boolean> {
  const activationLink = `${APP_URL}/activate?token=${token}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: `"MS Corp HR Portal" <${FROM_EMAIL}>`,
    to,
    subject: 'Activate Your HR Portal Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MS Corp Corp</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Manpower Division - HR Portal</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Welcome, ${firstName}!</h2>
          
          <p>Your HR Portal account has been created. To complete your registration and set your password, please click the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${activationLink}" style="background: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Activate My Account
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${activationLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This link will expire in 24 hours. If you did not request this email, please contact HR immediately.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} MS Corp Corp. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send activation email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  token: string
): Promise<boolean> {
  const resetLink = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

  const mailOptions = {
    from: `"MS Corp HR Portal" <${FROM_EMAIL}>`,
    to,
    subject: 'Reset Your HR Portal Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">MS Corp Corp</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Manpower Division - HR Portal</p>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Password Reset Request</h2>
          
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #1e40af; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="background: #f3f4f6; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
            ${resetLink}
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #6b7280; font-size: 12px; margin: 0;">
            This link will expire in 1 hour. If you did not request a password reset, please ignore this email or contact HR if you have concerns.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} MS Corp Corp. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function sendLeaveRequestNotification(
  to: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  status: string
): Promise<boolean> {
  const statusColor = status === 'Approved' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b';

  const mailOptions = {
    from: `"MS Corp HR Portal" <${FROM_EMAIL}>`,
    to,
    subject: `Leave Request ${status} - ${leaveType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Leave Request Update</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p>Hi ${employeeName},</p>
          <p>Your leave request has been updated:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Leave Type:</strong> ${leaveType}</p>
            <p style="margin: 5px 0;"><strong>Period:</strong> ${startDate} to ${endDate}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
          </div>
          
          <p>Log in to the HR Portal to view more details.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Failed to send notification email:', error);
    return false;
  }
}
