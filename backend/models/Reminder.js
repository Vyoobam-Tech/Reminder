import mongoose from "mongoose";
import { type } from "os";

const FileSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  url: String,
  mimetype: String,
  size: Number
}, { _id: false });

const reminderSchema = new mongoose.Schema({
  title: String,
  type: { type: String, default: "Custom" },
  notes: String,
  date: {type: Date},
  recurrence: { type: String, default: "One-time" },

  // 🔹 Link recipients directly
  recipients: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }
  ],

  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],


  image: FileSchema,
  video: FileSchema
}, { timestamps: true });

export default mongoose.model("Reminder", reminderSchema);
