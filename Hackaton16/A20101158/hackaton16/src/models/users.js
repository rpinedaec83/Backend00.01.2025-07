import pool from '../db/connection.js';

export const findUserByGoogleId = async (googleId) => {
  const [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
  return rows[0];
};

export const createUser = async (googleId, name, email) => {
  const [result] = await pool.query(
    'INSERT INTO users (google_id, name, email) VALUES (?, ?, ?)',
    [googleId, name, email]
  );
  return result.insertId;
};
