import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const ChartMax30100 = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Nhịp tim (°C)',
        borderColor: 'rgba(255, 215, 0, 1)', // Vàng
        backgroundColor: 'rgba(255, 223, 0, 0.2)', // Vàng nhạt
        data: [],
        tension: 0.2,
        fill: true,
      },
      {
        label: 'Oxy (%)',
        borderColor: 'rgba(0, 255, 0, 1)', // Xanh lá
        backgroundColor: 'rgba(144, 238, 144, 0.2)', // Xanh lá nhạt
        data: [],
        tension: 0.2,
        fill: true,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data...');
      try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:4000/api/data/max30100/dataChart', {
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
        const labels = result.map((item) => new Date(item.timestamp).toLocaleTimeString()).reverse(); // Đảo ngược labels
        const heartData = result.map((item) => item.heart).reverse(); // Đảo ngược dữ liệu heart
        const oxyData = result.map((item) => item.oxy).reverse(); // Đảo ngược dữ liệu oxy

        console.log('Labels:', labels, 'Heart Data:', heartData, 'Oxy Data:', oxyData);


        // Cập nhật dữ liệu
        setData({
          labels: labels,
          datasets: [
            {
              label: 'Nhịp tim (bpm)',
              borderColor: 'rgba(255, 215, 0, 1)', // Vàng
              backgroundColor: 'rgba(255, 223, 0, 0.2)', // Vàng nhạt
              data: heartData,
              tension: 0.2,
              fill: true,
            },
            {
              label: 'Oxy (%)',
              borderColor: 'rgba(0, 255, 0, 1)', // Xanh lá
              backgroundColor: 'rgba(144, 238, 144, 0.2)', // Xanh lá nhạt
              data: oxyData,
              tension: 0.2,
              fill: true,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // Cập nhật mỗi 5 giây
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

export default ChartMax30100;
