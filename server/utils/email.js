import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not configured. Email sending will be simulated.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendPasswordResetEmail = async (email, resetLink, userName) => {
  const transporter = createTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #2C1C24; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #FAF7F5; border-radius: 16px; padding: 40px; border: 1px solid #E0D8D0;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #2C1C24; margin: 0;">JALYN</h1>
          <p style="font-size: 14px; color: #888888; margin: 8px 0 0;">Couture & Fashion</p>
        </div>

        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #E0D8D0;">
          <h2 style="font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 600; color: #2C1C24; margin: 0 0 16px;">Password Reset Request</h2>
          
          <p style="font-size: 15px; color: #444444; margin: 0 0 16px;">Dear ${userName || 'Customer'},</p>
          
          <p style="font-size: 15px; color: #444444; margin: 0 0 16px;">We received a request to reset your password for your Jalyn account. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="display: inline-block; background: #2C1C24; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">Reset Your Password</a>
          </div>
          
          <p style="font-size: 13px; color: #888888; margin: 0 0 16px;"><strong>This link expires in 10 minutes.</strong> If you didn't request this, please ignore this email.</p>
          
          <p style="font-size: 13px; color: #888888; margin: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #D4A373; word-break: break-all; margin: 8px 0 0;">${resetLink}</p>
        </div>

        <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #E0D8D0;">
          <p style="font-size: 12px; color: #888888; margin: 0;">© 2026 Jalyn Couture & Fashion. All rights reserved.</p>
          <p style="font-size: 11px; color: #AAAAAA; margin: 8px 0 0;">If you have questions, contact us at <a href="mailto:support@jalyn.in" style="color: #D4A373;">support@jalyn.in</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
    Jalyn - Password Reset Request
    
    Dear ${userName || 'Customer'},
    
    We received a request to reset your password for your Jalyn account. 
    Please visit the following link to create a new password:
    
    ${resetLink}
    
    This link expires in 10 minutes. If you didn't request this, please ignore this email.
    
    ---
    © 2026 Jalyn Couture & Fashion. All rights reserved.
    Support: support@jalyn.in
  `;

  if (!transporter) {
    console.log('📧 [SIMULATED EMAIL] Password reset email would be sent to:', email);
    console.log('🔗 Reset Link:', resetLink);
    return { success: true, simulated: true };
  }

  try {
    await transporter.sendMail({
      from: `"Jalyn Couture" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: 'Reset Your Jalyn Account Password',
      text,
      html,
    });
    console.log('📧 Password reset email sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw error;
  }
};