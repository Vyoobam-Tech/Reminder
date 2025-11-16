import express from "express";
import Reminder from "../models/Reminder.js";
import scheduleReminder from "../Reminder/scheduleReminder.js";
import upload from "../middleware/upload.js";
import sendReminderEmail from "../utils/sendEmail.js";
import sendWhatsApp from "../utils/sendWhatsApp.js";


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

      if (body.date) {
        reminderData.date = body.date;   // store EXACT STRING
      }

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

      if (body.date) {
        updateData.date = body.date;   // store EXACT STRING
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

// Send reminder email and whatsapp manually

router.post('/:id/send', async (req,res) => {
  try {
    const remainder = await Reminder.findById(req.params.id)
    if (!remainder) {
      return res.status(404).json({error: 'Remainder Not found'})
    }

    if (remainder.email) {
      await sendReminderEmail (
        remainder.email,
        remainder.title,
        remainder.notes,
        remainder.image,
        remainder.video
      )
    }

    if (remainder.whatsapp) {
      await sendWhatsApp (
        remainder.whatsapp,
        remainder.title,
        remainder.notes,
        remainder.image,
        remainder.video
      )
    }

    res.json({success :true, message: 'remainder sent via Eamil & Whatsapp'})
  } catch (err) {
    res.status(500).json({error : err.message
    })
  }
})


export default router;

