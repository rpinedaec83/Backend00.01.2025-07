import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';
import { User } from './User.js';

export class Package extends Model {}

Package.init({
  id: { type: DataTypes.STRING(36), primaryKey: true },
  title: { type: DataTypes.STRING(120), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('CREATED','IN_TRANSIT','DELIVERED'), allowNull: false, defaultValue: 'CREATED' },
  origin: { type: DataTypes.STRING(180), allowNull: true },
  destination: { type: DataTypes.STRING(180), allowNull: true }
}, { sequelize, modelName: 'package' });

Package.belongsTo(User, { as: 'sender', foreignKey: { name: 'senderId', allowNull: false } });
Package.belongsTo(User, { as: 'courier', foreignKey: { name: 'courierId', allowNull: true } });
