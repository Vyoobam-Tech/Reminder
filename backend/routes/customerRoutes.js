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

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required' });
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
    const updateData = {};
    ['name', 'email', 'phone', 'note','address','preferredDelivery'].forEach(key => {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    });

    if (req.body.purchaseDate)
      updateData.purchaseDate = new Date(req.body.purchaseDate);

     if (req.body.dob)
      updateData.dob = new Date(req.body.dob);

    if ('reminderDate' in req.body)
      updateData.reminderDate = req.body.reminderDate ? new Date(req.body.reminderDate) : null;

    const updated = await Customer.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Customer not found' });

    if (updated.reminderDate) scheduleReminder(updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
