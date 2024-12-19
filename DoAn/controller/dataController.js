const pool = require('../config/db');

// Controller to get DHT11 data
const getDht11DataLatest = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM dht11_data ORDER BY timestamp DESC LIMIT 1");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching DHT11 data:", error);
    res.status(500).json({ error: "Failed to fetch DHT11 data" });
  }
};

// Controller to get MAX30100 data
const getMax30100DataLatest = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM max30100_data ORDER BY timestamp DESC LIMIT 1");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching MAX30100 data:", error);
    res.status(500).json({ error: "Failed to fetch MAX30100 data" });
  }
};

const getAllDht11Data = async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Giá trị mặc định: page = 1, limit = 20
  const offset = (page - 1) * limit;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM dht11_data ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Lấy tổng số bản ghi để tính tổng số trang
    const totalResult = await pool.query("SELECT COUNT(*) AS total FROM dht11_data");
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching DHT11 data:", error);
    res.status(500).json({ error: "Failed to fetch DHT11 data" });
  }
};


const getALLMax30100Data = async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // Giá trị mặc định: page = 1, limit = 20
  const offset = (page - 1) * limit;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM max30100_data ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    // Lấy tổng số bản ghi để tính tổng số trang
    const totalResult = await pool.query("SELECT COUNT(*) AS total FROM max30100_data");
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching MAX30100 data:", error);
    res.status(500).json({ error: "Failed to fetch MAX30100 data" });
  }
};

//api dữ liệu cho chart
const get10Dht11Data = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM dht11_data ORDER BY timestamp DESC LIMIT 10"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching latest DHT11 data:", error);
    res.status(500).json({ error: "Failed to fetch latest DHT11 data" });
  }
};

const get10Max30100Data = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM max30100_data ORDER BY timestamp DESC LIMIT 10"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching latest MAX30100 data:", error);
    res.status(500).json({ error: "Failed to fetch latest MAX30100 data" });
  }
};

const searchDht11Data = async (req, res) => {
  const { startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    // Kiểm tra nếu không có startDate hoặc endDate
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Vui lòng cung cấp startDate và endDate." });
    }

    // Truy vấn dữ liệu trong khoảng thời gian
    const query = `
      SELECT * FROM dht11_data
      WHERE timestamp BETWEEN $1 AND $2
      ORDER BY timestamp ASC
      LIMIT $3 OFFSET $4
    `;
    const { rows } = await pool.query(query, [startDate, endDate, limit, offset]);

    // Lấy tổng số bản ghi để tính tổng số trang
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM dht11_data
      WHERE timestamp BETWEEN $1 AND $2
    `;
    const totalResult = await pool.query(totalQuery, [startDate, endDate]);
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error searching DHT11 data:", error);
    res.status(500).json({ error: "Failed to search DHT11 data" });
  }
};

const searchMax30100Data = async (req, res) => {
  const { startDate, endDate, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Vui lòng cung cấp startDate và endDate." });
    }

    const query = `
      SELECT * FROM max30100_data
      WHERE timestamp BETWEEN $1 AND $2
      ORDER BY timestamp ASC
      LIMIT $3 OFFSET $4
    `;
    const { rows } = await pool.query(query, [startDate, endDate, limit, offset]);

    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM max30100_data
      WHERE timestamp BETWEEN $1 AND $2
    `;
    const totalResult = await pool.query(totalQuery, [startDate, endDate]);
    const total = parseInt(totalResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error("Error searching MAX30100 data:", error);
    res.status(500).json({ error: "Failed to search MAX30100 data" });
  }
};


module.exports = {
  getDht11DataLatest,
  getMax30100DataLatest,
  getAllDht11Data,
  getALLMax30100Data,
  get10Dht11Data,
  get10Max30100Data,
  searchDht11Data,
  searchMax30100Data,
};
