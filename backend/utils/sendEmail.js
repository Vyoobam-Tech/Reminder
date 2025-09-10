import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, notes) => {
  try {
    const msg = {
      to,
      from: process.env.SENDGRID_FROM,
      subject: `Reminder: ${subject}`,
      text: notes || 'No notes',
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed for ${to}:`, err.message);
  }
};

export default sendEmail;
