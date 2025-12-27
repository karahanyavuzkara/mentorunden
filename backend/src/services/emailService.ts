import nodemailer from 'nodemailer';

interface CancellationEmailData {
  studentEmail: string;
  studentName: string;
  mentorName: string;
  sessionDate: Date;
  sessionTime: string;
}

// Create transporter (using Gmail as example, you can configure with your email service)
const createTransporter = () => {
  // For production, use environment variables for email credentials
  // For now, using a simple SMTP configuration
  // You can use services like SendGrid, Mailgun, or AWS SES
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your email password or app password
    },
  });
};

export async function sendCancellationEmail(data: CancellationEmailData): Promise<void> {
  // If email is not configured, just log (for development)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('📧 Email not configured. Would send cancellation email to:', data.studentEmail);
    console.log('Email content:', {
      to: data.studentEmail,
      subject: 'Session Cancelled - Mentorunden',
      text: `Dear ${data.studentName},\n\nYour mentoring session with ${data.mentorName} scheduled for ${data.sessionDate.toLocaleDateString()} at ${data.sessionTime} has been cancelled.\n\nWe apologize for any inconvenience.\n\nBest regards,\nMentorunden Team`,
    });
    return;
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Mentorunden" <${process.env.SMTP_USER}>`,
      to: data.studentEmail,
      subject: 'Session Cancelled - Mentorunden',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Session Cancelled</h1>
            </div>
            <div class="content">
              <p>Dear ${data.studentName},</p>
              <p>We regret to inform you that your mentoring session has been cancelled.</p>
              <p><strong>Session Details:</strong></p>
              <ul>
                <li><strong>Mentor:</strong> ${data.mentorName}</li>
                <li><strong>Date:</strong> ${data.sessionDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
                <li><strong>Time:</strong> ${data.sessionTime}</li>
              </ul>
              <p>We apologize for any inconvenience this may cause. You can book a new session with your mentor or browse other available mentors.</p>
              <a href="${process.env.WEB_URL || 'http://localhost:3000'}/mentors" class="button">Browse Mentors</a>
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Best regards,<br>
                The Mentorunden Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Dear ${data.studentName},

We regret to inform you that your mentoring session has been cancelled.

Session Details:
- Mentor: ${data.mentorName}
- Date: ${data.sessionDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${data.sessionTime}

We apologize for any inconvenience this may cause. You can book a new session with your mentor or browse other available mentors.

Best regards,
The Mentorunden Team
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Cancellation email sent to:', data.studentEmail);
  } catch (error) {
    console.error('Error sending cancellation email:', error);
    throw error;
  }
}

