import cron from 'node-cron';
import sendEmail from './sendEmail.js';
import sendSMS from './sendSMS.js';
// import sendWhatsApp from './sendWhatsApp.js'; // Optional

const scheduleReminders = (customer) => {
  if (!customer.reminderDate) return;

  const date = new Date(customer.reminderDate);
  const cronExpr = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;

  cron.schedule(
    cronExpr,
    async () => {
      const { email, phone, note, name, preferredDelivery } = customer;

      try {
        if (preferredDelivery?.includes('email') && email) {
          await sendEmail(email, name, note);
        }

        if (preferredDelivery?.includes('sms') && phone) {
          await sendSMS(phone, name, note);
        }

        if (preferredDelivery?.includes('whatsapp') && phone) {
          await sendWhatsApp(phone, name, note);
        }

        console.log(`✅ Reminder sent to ${name}`);
      } catch (err) {
        console.error(`❌ Failed to send reminder to ${name}:`, err.message);
      }
    },
    {
      timezone: 'Asia/Kolkata',
    }
  );
};

export default scheduleReminders;