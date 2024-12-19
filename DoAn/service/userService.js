const bcrypt = require('bcrypt');
const pool = require('../config/db'); // Import pool từ db.js

// Các hàm sử dụng pool để truy vấn cơ sở dữ liệu
async function createUser(email, password) {
  
  await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2)',
    [email, password]
  );
  return { message: 'User created successfully' };
}

async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

module.exports = { createUser, findUserByEmail};
