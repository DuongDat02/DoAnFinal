const mqtt = require('mqtt');
const nodemailer = require('nodemailer');

const topics = {
  dht11: "esp32/dht11",
  mpu6050: "esp32/mpu6050",
  max30100: "esp32/max30100",
  health: "esp32/health",
  fall: "esp32/fall"
};

let healthFlag = false; // Track if "Critical" is received
let fallFlag = false; // Track if "fall" is received

let healthTimestamp = null; // Timestamp for "Critical" status
let fallTimestamp = null; // Timestamp for "fall" detection

const ALERT_THRESHOLD =  60 * 1000; // 1 minutes in milliseconds

const mqttHandler = (pool) => {
  const client = mqtt.connect({
    host: process.env.MQTT_HOST,
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    protocol: 'mqtts',
  });

  client.on('connect', () => {
    console.log("Connected to MQTT broker");
    client.subscribe(Object.values(topics), (err) => {
      if (err) console.error("Error subscribing:", err);
    });
  });

  // Email alert setup
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
  });

  const sendAlertMail = () => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'Duongdat75k@gmail.com', // Thay thế bằng email người nhận
        subject: 'Cảnh báo Khẩn Cấp',
        html: `
            <h2>Cảnh báo: Nguy cơ đột quỵ được phát hiện!</h2>
            <p>Hệ thống giám sát sức khỏe của bạn vừa phát hiện dấu hiệu bất thường. Bạn vừa có dấu hiệu bị ngã và nhịp tim đang tăng cao có thể dẫn đến đột quỵ.</p>
            
            <p><strong>Liên hệ khẩn cấp:</strong></p>
            <a href="tel:115" style="display:inline-block; background-color:red; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Gọi Cứu Thương (115)</a>
            <p><em>Lưu ý: Email này được gửi tự động từ hệ thống giám sát sức khỏe thông minh của bạn.</em></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Lỗi khi gửi email:", error);
        } else {
            console.log("Email đã gửi thành công:", info.response);
        }
    });
};

  const sendAlertFallMail = () => {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'Duongdat75k@gmail.com', // Replace with the recipient’s email
      subject: 'Cảnh báo ngã',
      html: `
            <p>Hệ thống giám sát sức khỏe của bạn vừa phát hiện dấu hiệu bất thường. Bạn vừa có dấu hiệu bị ngã.</p>
            
            <p><strong>Liên hệ khẩn cấp:</strong></p>
            <a href="tel:115" style="display:inline-block; background-color:red; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">Gọi Cứu Thương (115)</a>
            <p><em>Lưu ý: Email này được gửi tự động từ hệ thống giám sát sức khỏe thông minh của bạn.</em></p>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  };

  const saveToDatabase = async (table, data) => {
    let query, values;

    switch (table) {
      case 'dht11_data':
        query = "INSERT INTO dht11_data (temperature, humidity) VALUES ($1, $2)";
        values = [data.temperature, data.humidity];
        break;
      case 'mpu6050_data':
        query = `
          INSERT INTO mpu6050_data (ax, ay, az, gx, gy, gz)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        values = [
          data.accel ? data.accel.x : null,
          data.accel ? data.accel.y : null,
          data.accel ? data.accel.z : null,
          data.gyro ? data.gyro.x : null,
          data.gyro ? data.gyro.y : null,
          data.gyro ? data.gyro.z : null,
        ];
        break;
      case 'max30100_data':
        query = "INSERT INTO max30100_data (heart, oxy) VALUES ($1, $2)";
        values = [data.heartRate, data.SpO2];

      
        break;
      default:
        console.error(`Unknown table: ${table}`);
        return;
    }

    try {
      await pool.query(query, values);
      console.log(`Data saved to ${table}`);
      
      
    } catch (err) {
      console.error("Error saving data:", err);
    }
  };

  const checkAndSendAlert = () => {
    if (healthTimestamp === null && fallTimestamp) {
      sendAlertFallMail();
    }

    if (healthTimestamp && fallTimestamp) {
      const timeDifference = Math.abs(healthTimestamp - fallTimestamp);
      if (timeDifference <= ALERT_THRESHOLD) {
        sendAlertMail();

        // Reset timestamps
        healthTimestamp = null;
        fallTimestamp = null;
      }
    }
  };


  client.on('message', (topic, message) => {
    const msg = message.toString();
    let data;

    try {
      data = JSON.parse(msg);
    } catch (err) {
      console.error("Invalid JSON format:", msg);
      return;
    }

    switch (topic) {
      case topics.dht11:
        saveToDatabase('dht11_data', data);
        break;
      case topics.mpu6050:
        saveToDatabase('mpu6050_data', data);
        break;
      case topics.max30100:
        console.log("Received MAX30100 data:", data); // Log data to console
        saveToDatabase('max30100_data', data);
        break;

      case topics.fall:
        console.log("Received fall data:", data); // Log data to console
        if (data.predicted_label === "fall" ) {
          fallFlag = true;
          fallTimestamp = Date.now();
          checkAndSendAlert();
        }
        break;
      case topics.health:
        console.log("Received health data:", data); // Log data to console
        if (data.predicted_status === "Critical") {
          healthFlag = true;
          healthTimestamp = Date.now();
          checkAndSendAlert();
        }
        break;
      default:
        console.error(`Unknown topic: ${topic}`);
    }

  });

  client.on('error', (err) => {
    console.error("MQTT connection error:", err);
  });
};

module.exports = mqttHandler;
