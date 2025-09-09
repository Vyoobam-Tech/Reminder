import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (phone, title, notes = '', type = '') => {
  if (!phone) return;
  const to = `+91${phone}`;
  const from = process.env.TWILIO_PHONE;

  if (to === from) return;

  const messageBody = `Reminder: ${title}\n Type: ${type}` +
                      (notes ? `\n Notes: ${notes}` : '');

  try {
    const message = await client.messages.create({ body: messageBody, from, to });
    console.log(`✅ SMS sent to ${phone}: ${message.sid}`);
  } catch (err) {
    console.error(`❌ SMS error to ${phone}:`, err.message);
  }
};

export default sendSMS;
