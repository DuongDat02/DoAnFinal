require('dotenv').config();
const express = require("express");
const pool = require("./config/db");
const mqttHandler = require("./config/mqttHandler");
const createTables = require("./model/createTables");
const authRoutes = require("./route/authRoute");
const dataRoute = require('./route/dataRoute');
const healthAlert = require('./route/healthAlert'); // Import healthAlert.js

const cors = require('cors');


const app = express();

app.use(cors());


// Middleware để parse JSON
app.use(express.json());

// Định tuyến cho auth
app.use("/auth", authRoutes);

// Use the data routes
app.use('/api/data', dataRoute);


const initApp = async () => {
  try {
    // Tạo bảng nếu chưa tồn tại
    await createTables(pool);
    console.log("Tables are set up!");

    // Khởi động kết nối MQTT
    mqttHandler(pool);
    console.log("MQTT Host:", process.env.MQTT_HOST);
    console.log("MQTT User:", process.env.MQTT_USER);
    console.log("MQTT Password:", process.env.MQTT_PASSWORD);

    console.log("Listening to MQTT topics...");

    // Khởi động server Express
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    healthAlert(pool);
    console.log("Health alert system initialized!");

  } catch (error) {
    console.error("Error initializing app:", error);
  }
};

// Bắt đầu ứng dụng
initApp();
