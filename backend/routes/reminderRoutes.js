// import express from 'express';
// import Reminder from '../models/Reminder.js';
// import scheduleReminder from '../Reminder/scheduleReminder.js';

// const router = express.Router();

// router.get('/', async (req, res) => {
//   const reminders = await Reminder.find().sort({ date: -1 });
//   res.json(reminders);
// });

// router.post('/', async (req, res) => {
//   try {
//     const reminder = await Reminder.create(req.body);
//     scheduleReminder(reminder); // schedule when created
//     res.json(reminder);
//   } catch (err) {
//     console.error('❌ Reminder create error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put('/:id', async (req, res) => {
//   try {
//     const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     scheduleReminder(reminder); // re-schedule if edited
//     res.json(reminder);
//   } catch (err) {
//     console.error('❌ Reminder update error:', err.message);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   await Reminder.findByIdAndDelete(req.params.id);
//   res.json({ message: 'Deleted' });
// });



// // GET all reminders for calendar
// router.get('/calendar', async (req, res) => {
//   try {
//     const reminders = await Reminder.find();
//     const events = reminders.map(r => ({
//       id: r._id.toString(),
//       title: r.title,
//       start: r.date.toISOString(),
//     }));
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // CREATE reminder
// router.post('/', async (req, res) => {
//   try {
//     const newReminder = new Reminder(req.body);
//     await newReminder.save();
//     res.status(201).json(newReminder);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // UPDATE reminder
// router.put('/:id', async (req, res) => {
//   try {
//     const updated = await Reminder.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE reminder
// router.delete('/:id', async (req, res) => {
//   try {
//     await Reminder.findByIdAndDelete(req.params.id);
//     res.status(204).end();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;

import express from "express";
import Reminder from "../models/Reminder.js";
import scheduleReminder from "../Reminder/scheduleReminder.js";
import upload from "../middleware/upload.js";
import sendReminderEmail from "../utils/sendEmail.js";
import sendReminderEmail from "../Reminder/sendEmail.js";


const router = express.Router();

// ----------------------------
// GET all reminders
// ----------------------------
router.get("/", async (req, res) => {
  try {
    const reminders = await Reminder.find().sort({ date: -1 });

    // Normalize deliveryMethods & groupemail
    const normalized = reminders.map((r) => ({
      ...r.toObject(),
      deliveryMethods: Array.isArray(r.deliveryMethods)
        ? r.deliveryMethods
        : r.deliveryMethods
        ? [r.deliveryMethods]
        : [],
      groupemail: Array.isArray(r.groupemail)
        ? r.groupemail
        : r.groupemail
        ? [r.groupemail]
        : [],
    }));

    res.json(normalized);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// CREATE reminder with media
// ----------------------------
router.post(
  "/",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { body, files } = req;

      const reminderData = {
        ...body,
        deliveryMethods: Array.isArray(body.deliveryMethods)
          ? body.deliveryMethods
          : body.deliveryMethods
          ? [body.deliveryMethods]
          : [],
        groupemail: Array.isArray(body.groupemail)
          ? body.groupemail
          : body.groupemail
          ? [body.groupemail]
          : [],
        image: files.image
          ? {
              filename: files.image[0].filename,
              originalname: files.image[0].originalname,
              url: `/uploads/${files.image[0].filename}`,
              mimetype: files.image[0].mimetype,
              size: files.image[0].size,
            }
          : null,
        video: files.video
          ? {
              filename: files.video[0].filename,
              originalname: files.video[0].originalname,
              url: `/uploads/${files.video[0].filename}`,
              mimetype: files.video[0].mimetype,
              size: files.video[0].size,
            }
          : null,
      };

      const reminder = await Reminder.create(reminderData);
      scheduleReminder(reminder);

      res.status(201).json(reminder);
    } catch (err) {
      console.error("❌ Reminder create error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// ----------------------------
// UPDATE reminder with media
// ----------------------------
router.put(
  "/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { body, files } = req;

      const updateData = {
        ...body,
        deliveryMethods: Array.isArray(body.deliveryMethods)
          ? body.deliveryMethods
          : body.deliveryMethods
          ? [body.deliveryMethods]
          : [],
        groupemail: Array.isArray(body.groupemail)
          ? body.groupemail
          : body.groupemail
          ? [body.groupemail]
          : [],
      };

      // Add/replace image/video if uploaded
      if (files.image) {
        updateData.image = {
          filename: files.image[0].filename,
          originalname: files.image[0].originalname,
          url: `/uploads/${files.image[0].filename}`,
          mimetype: files.image[0].mimetype,
          size: files.image[0].size,
        };
      }
      if (files.video) {
        updateData.video = {
          filename: files.video[0].filename,
          originalname: files.video[0].originalname,
          url: `/uploads/${files.video[0].filename}`,
          mimetype: files.video[0].mimetype,
          size: files.video[0].size,
        };
      }

      const reminder = await Reminder.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      });
      scheduleReminder(reminder);

      res.json(reminder);
    } catch (err) {
      console.error("❌ Reminder update error:", err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// ----------------------------
// DELETE reminder
// ----------------------------
router.delete("/:id", async (req, res) => {
  try {
    await Reminder.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------
// GET reminders for calendar
// ----------------------------
router.get("/calendar", async (req, res) => {
  try {
    const reminders = await Reminder.find();
    const events = reminders.map((r) => ({
      id: r._id.toString(),
      title: r.title,
      start: r.date.toISOString(),
    }));
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Send reminder email manually
router.post("/:id/send", async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: "Reminder not found" });
    }

    await sendReminderEmail(
      reminder.email,
      reminder.title,
      reminder.notes,
      reminder.image
    );

    res.json({ success: true, message: "Email sent" });
  } catch (err) {
    console.error("❌ Email send error:", err.message);
    res.status(500).json({ error: err.message });
  }
});


export default router;

