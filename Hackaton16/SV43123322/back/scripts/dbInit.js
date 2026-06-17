require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function main() {
  const { MYSQLHOST, MYSQLUSER, MYSQLPASS, MYSQLBBDD, MYSQLPORT } = process.env;
  if (!MYSQLHOST || !MYSQLUSER || !MYSQLBBDD) {
    console.error('Faltan variables MySQL en .env');
    process.exit(1);
  }

  const initPath = path.join(__dirname, '..', 'src', 'models', 'init.sql');
  const seedPath = path.join(__dirname, '..', 'src', 'models', 'seedProducts.sql');

  if (!fs.existsSync(initPath)) {
    console.error('No se encuentra init.sql:', initPath);
    process.exit(1);
  }
  if (!fs.existsSync(seedPath)) {
    console.error('No se encuentra seedProducts.sql:', seedPath);
    process.exit(1);
  }

  const initSQL = fs.readFileSync(initPath, 'utf8');
  const seedSQL = fs.readFileSync(seedPath, 'utf8');

  let conn;
  try {
    conn = await mysql.createConnection({
      host: MYSQLHOST,
      user: MYSQLUSER,
      password: MYSQLPASS,
      database: MYSQLBBDD,
      port: MYSQLPORT ? Number(MYSQLPORT) : 3306,
      multipleStatements: true
    });

    console.log('Creando tablas...');
    await conn.query(initSQL);
    console.log('Tablas listas.');

    console.log('Insertando productos...');
    await conn.query(seedSQL);
    console.log('Productos cargados.');
  } catch (e) {
    console.error('Error inicializando BD:', e.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

main();