const { Pool } = require('pg');

// Tạo kết nối pool tới PostgreSQL
const pool = new Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: process.env.PG_PORT,
});

// Xuất pool để các file khác có thể sử dụng
module.exports = pool;
