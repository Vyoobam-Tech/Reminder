import twilio from 'twilio';
import dotenv from 'dotenv';
import cloudinary from './cloudinary.js';
import path from 'path';
dotenv.config();

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsApp = async (phone, name, note = '', image = null, video = null) => {
  if (!phone) return console.warn(`⚠️ No phone number for ${name}`);

  let cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) cleanPhone = cleanPhone.substring(2);
  if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
  if (!/^\d{10}$/.test(cleanPhone)) return console.warn(`⚠️ Invalid phone for ${name}`);

  const to = `whatsapp:+91${cleanPhone}`;
  const from = process.env.TWILIO_WHATSAPP_NUMBER;

  const mediaUrls = [];

  try {
    if (image && image.url) {
      const localImagePath = path.join(process.cwd(), image.url);
      const imgRes = await cloudinary.uploader.upload(localImagePath, { resource_type: 'image' });
      mediaUrls.push(imgRes.secure_url);
    }

    if (video && video.url) {
      const localVideoPath = path.join(process.cwd(), video.url);
      const vidRes = await cloudinary.uploader.upload(localVideoPath, { resource_type: 'video' });
      mediaUrls.push(vidRes.secure_url);
    }

    const message = await client.messages.create({
      from,
      to,
      body: `${name}, this is your WhatsApp reminder.${note ? `\n ${note}` : ''}`,
      ...(mediaUrls.length ? { mediaUrl: mediaUrls } : {})
    });

    console.log(`✅ WhatsApp sent to ${name}: ${message.sid}`);
  } catch (err) {
    console.error(`❌ Failed to send WhatsApp to ${name}:`, err.message);
  }
};

export default sendWhatsApp;
