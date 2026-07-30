import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { Package } from '../models/Package.js';
import { PackageLocation } from '../models/PackageLocation.js';
import { Message } from '../models/Message.js';
import { createPackage, addLocation, addMessage, markDelivered } from '../services/package.service.js';

export const packagesRouter = Router();

packagesRouter.post('/', requireAuth, async (req, res) => {
  const { title, description, origin, destination } = req.body || {};
  const pkg = await createPackage({ senderId: req.user.id, title, description, origin, destination });
  res.status(201).json(pkg);
});

packagesRouter.post('/:id/assign', requireAuth, requireRole('admin'), async (req, res) => {
  const { courierId } = req.body || {};
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.sendStatus(404);
  pkg.courierId = courierId;
  pkg.status = 'IN_TRANSIT';
  await pkg.save();
  res.json(pkg);
});

packagesRouter.post('/:id/location', requireAuth, requireRole('courier', 'admin'), async (req, res) => {
  const { lat, lng, note } = req.body || {};
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.sendStatus(404);
  const loc = await addLocation({ packageId: pkg.id, lat, lng, note });
  req.io.to(pkg.id).emit('location:update', { packageId: pkg.id, lat, lng, note, at: new Date().toISOString() });
  res.status(201).json(loc);
});

packagesRouter.post('/:id/deliver', requireAuth, requireRole('courier', 'admin'), async (req, res) => {
  try {
    const pkg = await markDelivered({ packageId: req.params.id });
    req.io.to(pkg.id).emit('package:delivered', { packageId: pkg.id, status: pkg.status });
    res.json(pkg);
  } catch (e) {
    res.sendStatus(404);
  }
});

packagesRouter.post('/:id/message', requireAuth, async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.sendStatus(404);
  const msg = await addMessage({ packageId: pkg.id, authorId: req.user.id, content: req.body?.content ?? '' });
  req.io.to(pkg.id).emit('package:message', { id: msg.id, content: msg.content, authorId: req.user.id, at: msg.createdAt });
  res.status(201).json(msg);
});

packagesRouter.get('/:id', requireAuth, async (req, res) => {
  const pkg = await Package.findByPk(req.params.id);
  if (!pkg) return res.sendStatus(404);
  const ok = (pkg.senderId === req.user.id) || (pkg.courierId === req.user.id) || (req.user.role === 'admin');
  if (!ok) return res.sendStatus(403);

  const locations = await PackageLocation.findAll({ where: { packageId: pkg.id }, order: [['createdAt', 'DESC']] });
  const messages = await Message.findAll({ where: { packageId: pkg.id }, order: [['createdAt', 'ASC']] });
  res.json({ pkg, locations, messages });
});

packagesRouter.get('/', requireAuth, async (req, res) => {
  const role = req.user.role;
  let where = {};
  if (role === 'client') where = { senderId: req.user.id };
  else if (role === 'courier') where = { courierId: req.user.id };
  const list = await Package.findAll({ where, order: [['createdAt', 'DESC']] });
  res.json(list);
});
