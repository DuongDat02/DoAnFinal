import React, { useEffect, useState } from 'react';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThermometerHalf, faTint, faHeartPulse, faLungs } from '@fortawesome/free-solid-svg-icons';
import ChartComponent from './Chart';
import ChartMax30100 from './ChartMax30100';


const Dashboard = () => {
  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [heart, setHeart] = useState(null);
  const [oxy, setOxy] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:4000/api/data/dht11/latest', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}` // Thêm token vào header
          }
        });

        const result = await response.json();
        console.log(result);
  
        // Kiểm tra nếu mảng không rỗng
        if (result.length > 0) {
          setTemperature(result[0].temperature.toFixed(2)); // Lấy giá trị từ phần tử đầu tiên
          setHumidity(result[0].humidity.toFixed(2));
        } else {
          console.error("API trả về mảng rỗng.");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  
    const interval = setInterval(fetchData, 5000); // Gọi API mỗi 5 giây
  
    return () => clearInterval(interval); // Xóa interval khi component bị unmount
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:4000/api/data/max30100/latest', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}` // Thêm token vào header
          }
        });

        const result = await response.json();
        console.log(result);
  
        // Kiểm tra nếu mảng không rỗng
        if (result.length > 0) {
          setHeart(result[0].heart.toFixed(2)); // Lấy giá trị từ phần tử đầu tiên
          setOxy(result[0].oxy.toFixed(0));
        } else {
          console.error("API trả về mảng rỗng.");
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  
    const interval = setInterval(fetchData, 2000); // Gọi API mỗi 5 giây
  
    return () => clearInterval(interval); // Xóa interval khi component bị unmount
  }, []);
  


  return (
    <div className="dashboard-content">
      <div className="parameter-row">
        {/* Column for temperature and humidity */}
        <div className="parameter-column">
          <div className="parameter-box temperature">
            <FontAwesomeIcon icon={faThermometerHalf} className="icon" />
            <h2>Nhiệt độ</h2>
            <p>{temperature !== null ? `${temperature} °C` : 'Loading...'}</p>
          </div>
          <div className="parameter-box humidity">
            <FontAwesomeIcon icon={faTint} className="icon" />
            <h2>Độ ẩm</h2>
            <p>{humidity !== null ? `${humidity} %` : 'Loading...'}</p>
          </div>
        </div>
  
        {/* Chart beside the column */}
        <div className="chart-box">
          <ChartComponent />
        </div>
      </div>
  
      <div className="parameter-row">
        {/* Column for heart and oxy */}
        <div className="parameter-column">
          <div className="parameter-box heart">
            <FontAwesomeIcon icon={faHeartPulse} className="icon" />
            <h2>Nhịp tim</h2>
            <p>{heart !== null ? `${heart} bpm` : 'Loading...'}</p>
          </div>
          <div className="parameter-box oxy">
            <FontAwesomeIcon icon={faLungs} className="icon" />
            <h2>Oxy</h2>
            <p>{oxy !== null ? `${oxy} %` : 'Loading...'}</p>
          </div>
        </div>
  
        {/* Chart beside the column */}
        <div className="chart-box">
          <ChartMax30100 />
        </div>
      </div>
    </div>
  );
  
};

export default Dashboard;
