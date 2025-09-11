import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

/**
 * Sends a WhatsApp reminder using Twilio Sandbox.
 * @param {string} phone - Customer phone number (with or without +91 / leading 0)
 * @param {string} name - Customer name
 * @param {string} note - Optional note content
 */
const sendWhatsApp = async (phone, name, note = '') => {
  if (!phone) {
    console.warn(`⚠️ No phone number provided for ${name}`);
    return;
  }

  // Remove all non-digits
  let cleanPhone = phone.replace(/\D/g, '');

  // If number starts with 91 and length is 12 → strip country code
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    cleanPhone = cleanPhone.substring(2);
  }

  // If number starts with 0 and length is 11 → strip leading 0
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Validate length (must be 10 digits for Indian mobile)
  if (!/^\d{10}$/.test(cleanPhone)) {
    console.warn(`⚠️ Invalid phone number for ${name}: ${phone}`);
    return;
  }

  // Format in WhatsApp E.164
  const to = `whatsapp:+91${cleanPhone}`;
  const from = process.env.TWILIO_WHATSAPP_NUMBER; // whatsapp:+14155238886 (sandbox)

  // Avoid sending to self
  if (to === from) {
    console.warn(`⚠️ Skipping WhatsApp to ${name}: sender and receiver can't be the same`);
    return;
  }

  try {
    const message = await client.messages.create({
      from,
      to,
      body: `Hi ${name}, this is your WhatsApp reminder.${note ? `\n📝 ${note}` : ''}`,
    });

    console.log(`✅ WhatsApp sent to ${name}: ${message.sid}`);
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp to ${name}:`, err.message);
  }
};

export default sendWhatsApp;
