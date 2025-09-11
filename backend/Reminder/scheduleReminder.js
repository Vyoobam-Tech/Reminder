import cron from 'node-cron';
import sendEmail from './sendEmail.js';
import sendSMS from './reminderSMS.js';
import Group from '../models/Group.js';

const scheduleReminder = (reminder) => {
  const reminderDate = new Date(reminder.date);
  if (reminderDate < new Date()) return;

  const [min, hour, day, month] = [
    reminderDate.getMinutes(),
    reminderDate.getHours(),
    reminderDate.getDate(),
    reminderDate.getMonth() + 1,
  ];

  const cronExpr = `${min} ${hour} ${day} ${month} *`;

  cron.schedule(
    cronExpr,
    async () => {
      console.log(`📨 Triggering: ${reminder.title}`);

      try {
        const { deliveryMethods = [], email, phone, groupemail = [] } = reminder;

        // 1. Individual email
        if (deliveryMethods.includes('email') && email) {
          await sendEmail(email, reminder.title, reminder.notes,reminder.image);
        }

        // 2. SMS
        if (deliveryMethods.includes('phone') && phone) {
          await sendSMS(phone, reminder.title, reminder.notes, reminder.type);
        }

        // 3. Group emails (supporting multiple group names)
        if (deliveryMethods.includes('emailgroup') && Array.isArray(groupemail)) {
          for (const groupName of groupemail) {
            const group = await Group.findOne({ name: groupName }).populate('members');
            if (!group) {
              console.warn(`⚠️ No group found for name: ${groupName}`);
              continue;
            }
            if (!group.members || group.members.length === 0) {
              console.warn(`⚠️ Group "${groupName}" has no members.`);
              continue;
            }

            for (const member of group.members) {
              if (member.email) {
                await sendEmail(member.email, reminder.title, reminder.notes);
              } else {
                console.warn(`⚠️ No email for group member ${member._id}`);
              }
            }
          }
        }
      } catch (e) {
        console.error('❌ Reminder failed:', e.message);
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
};

export default scheduleReminder;
