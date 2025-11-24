import express from 'express';
import xlsx from 'xlsx';
import Customer from '../models/Customer.js';
import scheduleReminder from '../Reminder/scheduleReminder.js';

const router = express.Router();

// 1️⃣ Upload Excel
router.post('/upload', async (req, res) => {
  try {

    const file = req.files?.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.read(file.data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const existing = await Customer.find({}, 'email phone');
    const emailSet = new Set(existing.map(c => c.email));
    const phoneSet = new Set(existing.map(c => c.phone));

    const filtered = data.filter(c =>
      !emailSet.has(c.email) && !phoneSet.has(c.phone)
    );
    const skipped = data.filter(c =>
      emailSet.has(c.email) || phoneSet.has(c.phone)
    );

    const inserted = await Customer.insertMany(filtered);

    inserted.forEach(c => c.reminderDate && scheduleReminder(c));

    res.json({
      success: true,
      insertedCount: inserted.length,
      skipped, // Send skipped duplicates back
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 2️⃣ Add Manually
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, purchaseDate, reminderDate, note, address, dob, preferredDelivery,} = req.body;

    const existingEmail = await Customer.findOne({ email })
    if(existingEmail) {
      return res.status(400).json({message: "Email already exists"})
    }

    const existingPhone = await Customer.findOne({ phone })
    if(existingPhone) {
      return res.status(400).json({message: "Phone Number already exists"})
    }

    const customer = new Customer({
      name,
      email,
      phone,
      note: note || '',
      address: address || '',
      dob: dob ? new Date(dob) : null,
      purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      preferredDelivery: preferredDelivery || [],
    });

    await customer.save();

    if (customer.reminderDate) scheduleReminder(customer);

    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3️⃣ List
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ purchaseDate: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4️⃣ Update
router.put('/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    const { name, email, phone, note, address, preferredDelivery, purchaseDate, dob, reminderDate } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (note !== undefined) updateData.note = note;
    if (address !== undefined) updateData.address = address;
    if (preferredDelivery !== undefined) updateData.preferredDelivery = preferredDelivery;

    // Validate unique email (ignore current customer)
    if (email) {
      const existingEmail = await Customer.findOne({
        email,
        _id: { $ne: customerId },
      });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Validate unique phone (ignore current customer)
    if (phone) {
      const existingPhone = await Customer.findOne({
        phone,
        _id: { $ne: customerId },
      });
      if (existingPhone) {
        return res.status(400).json({ message: "Phone Number already exists" });
      }
    }

    if (purchaseDate) updateData.purchaseDate = new Date(purchaseDate);
    if (dob) updateData.dob = new Date(dob);
    if (reminderDate !== undefined)
      updateData.reminderDate = reminderDate ? new Date(reminderDate) : null;

    const updated = await Customer.findByIdAndUpdate(customerId, updateData, {
      new: true,
    });

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 5️⃣ Delete
router.delete('/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;
