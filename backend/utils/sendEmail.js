// import sgMail from '@sendgrid/mail';
// import dotenv from 'dotenv';
// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (to, subject, notes) => {
//   try {
//     const msg = {
//       to,
//       from: process.env.SENDGRID_FROM,
//       subject: `Reminder: ${subject}`,
//       text: notes || 'No notes',
//     };

//     await sgMail.send(msg);
//     console.log(`✅ Email sent to ${to}`);
//   } catch (err) {
//     console.error(`❌ Email failed for ${to}:`, err.message);
//   }
// };

// export default sendEmail;

import sgMail from "@sendgrid/mail";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendReminderEmail = async (to, subject, notes, imageObj) => {
  try {
    let msg = {
      to,
      from: process.env.SENDGRID_FROM,
      subject: `Reminder: ${subject}`,
      text: notes || "No notes",
      html: `<p>${notes || "No notes"}</p>`,
      attachments: []
    };

    // ✅ Make sure imageObj has filename
    if (imageObj && imageObj.filename) {
      const filePath = path.join(process.cwd(), "uploads", imageObj.filename);

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath).toString("base64");

        msg.attachments.push({
          content: fileContent,
          filename: imageObj.originalname || imageObj.filename,
          type: imageObj.mimetype || "application/octet-stream",
          disposition: "inline",
          content_id: "reminderImage"
        });

        // Inline embed
        msg.html += `<br/><img src="cid:reminderImage" alt="Reminder Image" style="max-width:600px;"/>`;
      } else {
        console.error("❌ File not found:", filePath);
      }
    }

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error(`❌ Email failed for ${to}:`, err.message);
  }
};

export default sendReminderEmail;

