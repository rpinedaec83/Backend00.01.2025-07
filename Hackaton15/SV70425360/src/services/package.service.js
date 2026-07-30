import { randomUUID } from 'crypto';
import { Package } from '../models/Package.js';
import { PackageLocation } from '../models/PackageLocation.js';
import { Message } from '../models/Message.js';

export async function createPackage({ senderId, title, description, origin, destination, courierId=null }) {
  const pkg = await Package.create({
    id: randomUUID(),
    title, description, origin, destination, senderId, courierId
  });
  return pkg;
}

export async function addLocation({ packageId, lat, lng, note }) {
  return PackageLocation.create({ packageId, lat, lng, note });
}

export async function addMessage({ packageId, authorId, content }) {
  return Message.create({ packageId, authorId, content });
}

export async function markDelivered({ packageId }) {
  const pkg = await Package.findByPk(packageId);
  if (!pkg) throw new Error('not_found');
  pkg.status = 'DELIVERED';
  await pkg.save();
  return pkg;
}
