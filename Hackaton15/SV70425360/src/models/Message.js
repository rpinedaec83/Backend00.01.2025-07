import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';
import { Package } from './Package.js';
import { User } from './User.js';

export class Message extends Model {}

Message.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  content: { type: DataTypes.STRING(500), allowNull: false }
}, { sequelize, modelName: 'message', timestamps: true });

Message.belongsTo(Package, { as: 'package', foreignKey: { name: 'packageId', allowNull: false } });
Message.belongsTo(User, { as: 'author', foreignKey: { name: 'authorId', allowNull: false } });
