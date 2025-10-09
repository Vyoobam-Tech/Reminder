import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { filterValidFiles, getPreviews } from "../utils/fileUtils";

const useReminders = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [reminders, setReminders] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [whatsapp, setWhatsapp] = useState("");

  const notifiedRemindersRef = useRef(new Set());

  useEffect(() => {
    const checkReminders = setInterval(() => {
      const now = new Date();
      const nowFormatted = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(
        now.getHours()
      ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      reminders.forEach((reminder, index) => {
        const reminderFormatted = `${reminder.date} ${reminder.time}`;
        if (
          reminderFormatted === nowFormatted &&
          !notifiedRemindersRef.current.has(index)
        ) {
          const formData = new FormData();
          formData.append("to", reminder.email);
          formData.append("subject", `Reminder: ${reminder.title}`);
          formData.append("text", reminder.description);
          formData.append("title", reminder.title);
          formData.append("description", reminder.description);
          formData.append("date", reminder.date);
          formData.append("time", reminder.time);
          formData.append("email", reminder.email);
          formData.append("whatsapp", reminder.whatsapp);
          reminder.files?.forEach((file) => {
            formData.append("attachments", file);
          });

          axios
            .post("http://localhost:5000/send-email", formData)
            .then((res) => {
              console.log("Email sent and data saved:", res.data);
            })
            .catch((err) => {
              console.error("Error sending email or saving data:", err);
            });
          notifiedRemindersRef.current.add(index);
        }
      });
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [reminders]);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = filterValidFiles(selectedFiles);
    setFiles(validFiles);
    setPreviews(getPreviews(validFiles));
  };

  const addReminder = () => {
    if (!title || !description || !date || !time || !email) return;

    if (!email.endsWith("@gmail.com")) {
      setEmailError("Only @gmail.com addresses are allowed");
      return;
    }

    setEmailError("");

    const newReminder = {
      title,
      description,
      date,
      time,
      email,
      whatsapp,
      files,
    };

    if (editIndex !== null) {
      const updatedReminders = reminders.map((reminder, index) =>
        index === editIndex ? newReminder : reminder
      );
      setReminders(updatedReminders);
      notifiedRemindersRef.current.delete(editIndex);
      setEditIndex(null);
    } else {
      setReminders([...reminders, newReminder]);
    }

    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setEmail("");
    setWhatsapp("");
    setFiles([]);
    setPreviews([]);
  };

  const editReminder = (index) => {
    const reminder = reminders[index];
    setTitle(reminder.title);
    setDescription(reminder.description);
    setDate(reminder.date);
    setTime(reminder.time);
    setEmail(reminder.email);
    setWhatsapp(reminder.whatsapp);
    setFiles(reminder.files || []);
    setPreviews(getPreviews(reminder.files || []));
    setEditIndex(index);
    setEmailError("");
  };

  const deleteReminder = (index) => {
    setReminders(reminders.filter((_, i) => i !== index));
    notifiedRemindersRef.current.delete(index)
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    date,
    setDate,
    time,
    setTime,
    email,
    setEmail,
    emailError,
    setEmailError,
    reminders,
    setReminders,
    editIndex,
    setEditIndex,
    files,
    setFiles,
    previews,
    setPreviews,
    whatsapp,
    setWhatsapp,
    handleFileChange,
    addReminder,
    editReminder,
    deleteReminder,
  };
};

export default useReminders;