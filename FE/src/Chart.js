import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ChartComponent = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Nhiệt độ (°C)',
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        data: [],
        tension: 0.5,
        fill: true,
      },
      {
        label: 'Độ ẩm (%)',
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        data: [],
        tension: 0.5,
        fill: true,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data...');
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:4000/api/data/dht11/dataChart', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}` // Thêm token vào header
          }
        });

        if (!response.ok) {
          console.error(`API Error: ${response.status}`);
        }
        const result = await response.json();

        // Lấy labels từ timestamp và dữ liệu từ API
        const labels = result.map((item) => new Date(item.timestamp).toLocaleTimeString()).reverse();
        const temperatureData = result.map((item) => item.temperature).reverse(); 
        const humidityData = result.map((item) => item.humidity).reverse(); 
        console.log('Labels:', labels, 'Temperature Data:', temperatureData, 'Humidity Data:', humidityData);


        // Cập nhật dữ liệu
        setData({
          labels: labels,
          datasets: [
            {
              label: 'Nhiệt độ (°C)',
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              data: temperatureData,
              tension: 0.5,
              fill: true,
            },
            {
              label: 'Độ ẩm (%)',
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              data: humidityData,
              tension: 0.5,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 2000); // Cập nhật mỗi 5 giây
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    const newChartInstance = new Chart(ctx, {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
            },
          },
          y: {
            title: {
              display: true,
            },
            beginAtZero: true,
          },
        },
      },
    });

    chartInstanceRef.current = newChartInstance;

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [data]);

  return <canvas ref={chartRef} className="chart" />;
};

export default ChartComponent;
