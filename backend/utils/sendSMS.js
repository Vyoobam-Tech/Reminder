import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendSMS = async (phone, name, note = '') => {
  const to = `+91${phone}`;
  const from = process.env.TWILIO_PHONE;

  if (to === from) {
    console.warn(`⚠️ Skipping SMS to ${name}: sender and receiver can't be same`);
    return;
  }

  const body = `Hi ${name}, this is your SMS reminder.${note ? `\n📝 ${note}` : ''}`;

  try {
    const message = await client.messages.create({
      body,
      from,
      to,
    });

    console.log(`✅ SMS sent to ${name}: ${message.sid}`);
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${name}:`, err.message);
  }
};

export default sendSMS;