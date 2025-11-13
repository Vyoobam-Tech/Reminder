// routes/groupRoutes.js
import express from 'express';
import Group from '../models/Group.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const groups = await Group.find().populate('members');
  res.json(groups);
});

router.post('/', async (req, res) => {
  const { name, members } = req.body;
  const group = new Group({ name, members });
  await group.save();
  res.status(201).json(group);
});

router.put('/:id', async (req, res) => {
  const { name, members } = req.body;
  const updatedGroup = await Group.findByIdAndUpdate(
    req.params.id,
    { name, members },
    { new: true }
  );
  if (!updatedGroup) return res.status(404).json({ message: 'Group not found' });
  res.json(updatedGroup);
});

router.delete('/:id', async (req, res) => {
  const deleted = await Group.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Group not found' });
  res.json({ message: 'Group deleted' });
});

export default router;
