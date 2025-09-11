// import mongoose from 'mongoose';

// const reminderSchema = new mongoose.Schema({
//   title: String,
//   type: String,
//   notes: String,
//   date: Date,
//   recurrence: String,
//   assignedTo: String,
//   deliveryMethods: [String], // ['email', 'phone', 'whatsapp']
//   email: String,
//   phone: String,
//   whatsapp: String,
//   groupemail:[String] // Array of email addresses for group notifications
// });

// export default mongoose.model('Reminder', reminderSchema);


import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  filename: String,       // actual saved name on disk (or S3 key)
  originalname: String,   // original file name
  url: String,            // accessible URL (e.g., /uploads/... or S3 URL)
  mimetype: String,       // MIME type (image/png, video/mp4, etc.)
  size: Number            // file size in bytes
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  title: String,
  type: { type: String, default: "Custom" },
  notes: String,
  date: Date,
  recurrence: { type: String, default: "One-time" },
  assignedTo: String,
  deliveryMethods: [String],  // ['email', 'phone', 'whatsapp', 'emailgroup']
  email: String,
  phone: String,
  whatsapp: String,
  groupemail: [String],       // group email list

  // 🔹 New fields for media
  image: FileSchema,          // store uploaded image metadata
  video: FileSchema           // store uploaded video metadata
}, { timestamps: true });

export default mongoose.model("Reminder", reminderSchema);
