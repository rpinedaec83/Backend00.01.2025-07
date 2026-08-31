// src/models.js (ejemplo de centralización)
const { DataTypes } = require('sequelize');
const sequelize = require('./db');


const User = sequelize.define('User', {
  User: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'users' });

const Order = sequelize.define('Order', {
Product: { type: DataTypes.STRING, allowNull: true},
Price:  { type: DataTypes.FLOAT, allowNull: true},
  
}, { tableName: 'Orders', paranoid: true});


User.hasMany(Order,{foreignKey:"BuyerId"});
Order.belongsTo(User,{foreignKey:"BuyerId"});


module.exports = { sequelize, User, Order};
