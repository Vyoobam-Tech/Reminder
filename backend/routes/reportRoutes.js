// routes/reportRoutes.js
import express from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import Customer from '../models/Customer.js';

const router = express.Router();

router.get('/export', async (req, res) => {
  const type = req.query.type;
  const customers = await Customer.find();

  if (type === 'excel') {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Customers');

    sheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Phone', key: 'phone', width: 20 },
      { header: 'Purchase Date', key: 'purchaseDate', width: 20 },
      { header: 'Reminder Date', key: 'reminderDate', width: 20 },
      { header: 'Note', key: 'note', width: 40 },
    ];

    customers.forEach(c => sheet.addRow({
      name: c.name,
      email: c.email,
      phone: c.phone,
      purchaseDate: c.purchaseDate?.toISOString()?.split('T')[0],
      reminderDate: c.reminderDate?.toISOString()?.split('T')[0],
      note: c.note || '',
    }));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  else if (type === 'pdf') {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=customers.pdf");

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(18).text("Customer Report", { align: "center" });
    doc.moveDown();

    customers.forEach(c => {
      doc.fontSize(12).text(`Name: ${c.name}`);
      doc.text(`Email: ${c.email}`);
      doc.text(`Phone: ${c.phone}`);
      doc.text(`Purchase: ${c.purchaseDate?.toDateString()}`);
      doc.text(`Reminder: ${c.reminderDate?.toDateString()}`);
      doc.text(`Note: ${c.note || '-'}`);
      doc.moveDown();
    });

    doc.end();
  }

  else {
    res.status(400).json({ message: 'Invalid export type' });
  }
});

export default router;
