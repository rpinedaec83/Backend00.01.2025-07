import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/index.js';
import { Package } from './Package.js';

export class PackageLocation extends Model {}

PackageLocation.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  lat: { type: DataTypes.DECIMAL(10,7), allowNull: false },
  lng: { type: DataTypes.DECIMAL(10,7), allowNull: false },
  note: { type: DataTypes.STRING(240), allowNull: true }
}, { sequelize, modelName: 'package_location', timestamps: true });

PackageLocation.belongsTo(Package, { as: 'package', foreignKey: { name: 'packageId', allowNull: false } });
