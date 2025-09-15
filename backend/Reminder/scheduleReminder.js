import cron from "node-cron";
import sendEmail from "../utils/sendEmail.js";
import sendSMS from "../utils/sendSMS.js";
import sendWhatsApp from "../utils/sendWhatsApp.js";
import Group from "../models/Group.js";
import Reminder from "../models/Reminder.js";

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
        // ✅ Reload reminder with both recipients and groups populated
        const populatedReminder = await Reminder.findById(reminder._id)
          .populate("recipients") // individual customers
          .populate({
            path: "groups",
            populate: { path: "members" }, // each group's members (customers)
          });

        if (!populatedReminder) return;

        // ----------------------------
        // 🔹 Send to individual recipients
        // ----------------------------
        for (const customer of populatedReminder.recipients) {
          for (const method of customer.preferredDelivery || []) {
            if (method === "email" && customer.email) {
              await sendEmail(
                customer.email,
                populatedReminder.title,
                populatedReminder.notes,
                populatedReminder.image,
                populatedReminder.video
              );
            }

            if (method === "phone" && customer.phone) {
              await sendSMS(
                customer.phone,
                populatedReminder.title,
                populatedReminder.notes,
                populatedReminder.type
              );
            }

            if (method === "whatsapp" && customer.phone) {
              console.log(`📲 Sending WhatsApp to: ${customer.phone}`);
              await sendWhatsApp(
                customer.phone,
                populatedReminder.title,
                populatedReminder.notes,
                populatedReminder.image,
                populatedReminder.video
              );
            }
          }
        }

        // ----------------------------
        // 🔹 Send to group members
        // ----------------------------
        for (const group of populatedReminder.groups || []) {
          if (!group.members?.length) continue;

          for (const member of group.members) {
            for (const method of member.preferredDelivery || []) {
              if (method === "email" && member.email) {
                await sendEmail(
                  member.email,
                  populatedReminder.title,
                  populatedReminder.notes,
                  populatedReminder.image,
                  populatedReminder.video
                );
              }

              if (method === "phone" && member.phone) {
                await sendSMS(
                  member.phone,
                  populatedReminder.title,
                  populatedReminder.notes,
                  populatedReminder.type
                );
              }

              if (method === "whatsapp" && member.phone) {
                console.log(`📲 Sending WhatsApp to (group member): ${member.phone}`);
                await sendWhatsApp(
                  member.phone,
                  populatedReminder.title,
                  populatedReminder.notes,
                  populatedReminder.image,
                  populatedReminder.video
                );
              }
            }
          }
        }
      } catch (e) {
        console.error("❌ Reminder failed:", e.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
};

export default scheduleReminder;
