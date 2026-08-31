const {Sequelize} =require('sequelize')
require('dotenv').config()

const sequelize=new Sequelize(
      process.env.MYSQLBBDD,
      process.env.MYSQLUSER,
      process.env.MYSQLPASS,
      {host:process.env.DB_HOST,dialect:process.env.DB_DIALECT,logging:false}
)

module.exports=sequelize