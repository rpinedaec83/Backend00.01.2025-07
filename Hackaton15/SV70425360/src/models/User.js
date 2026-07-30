import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';

export class User extends Model {}

User.init({
  id: { type: DataTypes.STRING(64), primaryKey: true },
  provider: { type: DataTypes.STRING(32), allowNull: false },
  email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(120), allowNull: true },
  avatar: { type: DataTypes.STRING(512), allowNull: true },
  role: { type: DataTypes.STRING(20), allowNull: false, defaultValue: 'client' }
}, { sequelize, modelName: 'user' });
