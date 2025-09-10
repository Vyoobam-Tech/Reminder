// import twilio from 'twilio';
// import dotenv from 'dotenv';
// dotenv.config();

// const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// /**
//  * Sends an SMS reminder to the customer.
//  * @param {string} phone - Customer phone number (Indian format)
//  * @param {string} name - Customer name
//  * @param {string} note - Optional note content to include
//  */
// const sendWhatsApp = async (phone, name, note = '') => {
//   const to = `+91${phone}`;
//   const from = process.env.TWILIO_PHONE;

//   if (to === from) {
//     console.warn(`⚠️ Skipping SMS to ${name}: 'to' and 'from' cannot be the same`);
//     return;
//   }

//   try {
//     const message = await client.messages.create({
//       body: `Hi ${name}, this is your reminder.\n📝 Note: ${note || 'No note.'}`,
//       from,
//       to,
//     });
//     console.log(`✅ SMS sent to ${name}: ${message.sid}`);
//   } catch (err) {
//     console.error(`❌ Failed to send SMS to ${name}:`, err.message);
//   }
// };

// export default sendWhatsApp;