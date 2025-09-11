import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends an SMS using Twilio
 * @param {string} phone - 10-digit phone number without country code
 * @param {string} name - Name of the recipient
 * @param {string} note - Optional note for the message
 * @returns {boolean} - true if sent successfully, false otherwise
 */
const sendSMS = async (phone, name, note = '') => {
  // 1️⃣ Validate phone
  if (!phone) {
    console.warn(`⚠️ No phone number provided for ${name}`);
    return false;
  }

  const cleanPhone = phone.replace(/\D/g, ''); // remove non-digit characters
  if (!/^\d{10}$/.test(cleanPhone)) {
    console.warn(`⚠️ Invalid phone number for ${name}: ${phone}`);
    return false;
  }

  const to = `+91${cleanPhone}`;
  const from = process.env.TWILIO_PHONE;

  // 2️⃣ Prevent sending to same number as Twilio sender
  if (to === from) {
    console.warn(`⚠️ Skipping SMS to ${name}: sender and receiver can't be the same`);
    return false;
  }

  // 3️⃣ Construct message
  const body = `Hi ${name}, this is your SMS reminder.${note ? `\n📝 ${note}` : ''}`;

  try {
    const message = await client.messages.create({ body, from, to });
    console.log(`✅ SMS sent to ${name}: ${message.sid}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send SMS to ${name}:`, err.message);
    return false;
  }
};

export default sendSMS;
