const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service provider
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS  // Your email password or app-specific password
    }
  });
// Hàm gửi cảnh báo qua email
const sendAlertMail = (type, value, threshold) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'kakashi25k@gmail.com',
    subject: `Cảnh báo nguy hiểm: ${type}`,
    text: `Giá trị ${type} hiện tại là ${value}, vượt ngưỡng an toàn ${threshold}. Hãy kiểm tra ngay!`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log(`Alert email sent: ${info.response}`);
    }
  });
};

const calculateDailyAverages = async (pool) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const tempResult = await pool.query(`
      SELECT AVG(temperature) AS avg_temperature
      FROM dht11_data
      WHERE timestamp BETWEEN $1 AND $2
    `, [startOfDay, now]);

    const avgTemperature = tempResult.rows[0].avg_temperature;

    const healthResult = await pool.query(`
      SELECT AVG(heart) AS avg_heart_rate, AVG(oxy) AS avg_spo2
      FROM max30100_data
      WHERE timestamp BETWEEN $1 AND $2
    `, [startOfDay, now]);

    const avgHeartRate = healthResult.rows[0].avg_heart_rate;
    const avgSpO2 = healthResult.rows[0].avg_spo2;

    console.log("Daily Averages:", { avgTemperature, avgHeartRate, avgSpO2 });

    if (avgTemperature !== null && avgTemperature < 36 && avgTemperature > 37.5) {
      sendAlertMail('Nhiệt độ', avgTemperature, '< 36°C');
    }

    if (avgHeartRate !== null && (avgHeartRate < 60 || avgHeartRate > 100)) {
      sendAlertMail('Nhịp tim', avgHeartRate, '60-100 bpm');
    }

    if (avgSpO2 !== null && avgSpO2 < 95) {
      sendAlertMail('SpO2', avgSpO2, '< 95%');
    }
  } catch (err) {
    console.error("Error calculating averages:", err);
  }
};

const startHealthAlert = (pool) => {
  setInterval(() => calculateDailyAverages(pool),  60 * 60 * 1000); // Mỗi 1 giờ
};

module.exports = startHealthAlert;
