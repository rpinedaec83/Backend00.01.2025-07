const mysql=require('mysql2')
const con = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user:process.env.MYSQLUSER,
    password:process.env.MYSQLPASS,
    database:process.env.MYSQLBBDD
})

 module.exports=con