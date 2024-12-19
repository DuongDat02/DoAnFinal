const createTables = async (pool) => {
    const queries = [
      `
        CREATE TABLE IF NOT EXISTS dht11_data (
          id SERIAL PRIMARY KEY,
          temperature REAL,
          humidity REAL,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS mpu6050_data (
          id SERIAL PRIMARY KEY,
          ax REAL,
          ay REAL,
          az REAL,
          gx REAL,
          gy REAL,
          gz REAL,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS max30100_data (
          id SERIAL PRIMARY KEY,
          heart REAL,
          oxy REAL,
          timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `,
      `
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `
    ];
    for (let query of queries) {
      await pool.query(query);
    }
  };

  module.exports = createTables;
  