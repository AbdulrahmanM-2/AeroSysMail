import nodemailer from 'nodemailer';

// Initialize Nodemailer transporter
// In production, this would connect to your actual SMTP server (e.g., Postfix, SendGrid, AWS SES)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.aerosys.aero',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'admin@aerosys.aero',
    pass: process.env.SMTP_PASS || 'demo_password',
  },
});

export async function sendEmail(to: string, subject: string, text: string, html?: string) {
  try {
    const info = await transporter.sendMail({
      from: `"Aerosys Admin" <${process.env.SMTP_USER || 'admin@aerosys.aero'}>`,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log('Message sent: %s', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// For incoming emails, you would typically set up a webhook endpoint
// that your mail server (like SendGrid Inbound Parse or AWS SES SNS) calls
// when a new email arrives.
export async function handleIncomingEmailWebhook(payload: any) {
  // Example structure for SendGrid Inbound Parse
  const { to, from, subject, text, html } = payload;
  
  // Here you would save the email to your database using Prisma
  // await prisma.email.create({ ... })
  
  return {
    success: true,
    processed: true
  };
}