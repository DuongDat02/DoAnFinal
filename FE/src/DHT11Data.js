import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import './style.css';

const DHT11Data = () => {
  const [data, setData] = useState([]); // Dữ liệu hiển thị
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang từ API
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSearching, setIsSearching] = useState(false); // Trạng thái tìm kiếm

  // Hàm gọi API toàn bộ dữ liệu
  const fetchData = async (page) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:4000/api/data/dht11/alldata?page=${page}&limit=20`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      });

      const result = await response.json();

      setData(result.data); // Gán dữ liệu từ API
      setTotalPages(result.totalPages); // Tổng số trang từ API
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Hàm gọi API tìm kiếm
  const fetchSearchData = async (page) => {
    try {
      const token = localStorage.getItem('authToken');

      // Kiểm tra nếu `startDate` và `endDate` hợp lệ
      if (!startDate || !endDate) {
        alert('Vui lòng chọn khoảng thời gian.');
        return;
      }

      // Chuyển đổi `startDate` và `endDate` sang định dạng ISO 8601
      const formattedStartDate = new Date(startDate).toISOString();
      const formattedEndDate = new Date(endDate).toISOString();

      const response = await fetch(
        `http://localhost:4000/api/data/dht11/search?startDate=${formattedStartDate}&endDate=${formattedEndDate}&page=${page}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.data && result.data.length > 0) {
        setData(result.data); // Gán dữ liệu tìm kiếm
        setTotalPages(result.totalPages); // Cập nhật tổng số trang
        setCurrentPage(result.page); // Đặt lại trang hiện tại
      } else {
        alert('Không tìm thấy dữ liệu trong khoảng thời gian này.');
        setData([]); // Xóa dữ liệu hiển thị nếu không tìm thấy kết quả
      }
    } catch (error) {
      console.error('Error fetching search data:', error);
      alert('Đã xảy ra lỗi khi tìm kiếm dữ liệu.');
    }
  };

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    setIsSearching(true); // Bật trạng thái tìm kiếm
    fetchSearchData(1); // Luôn tìm kiếm từ trang đầu tiên
  };

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);

      if (isSearching) {
        // Nếu đang tìm kiếm, gọi lại API tìm kiếm
        fetchSearchData(page);
      } else {
        // Nếu không tìm kiếm, gọi API toàn bộ dữ liệu
        fetchData(page);
      }
    }
  };

  // Lấy dữ liệu lần đầu khi component được mount
  useEffect(() => {
    fetchData(currentPage);
  }, []);

  return (
    <div className='sensordata-content'>
      <h1>Dữ liệu nhiệt độ và độ ẩm</h1>
      <div className='search-controls'>
        <label>
          Start Date:
          <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          End Date:
          <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <button onClick={handleSearch}>Search</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nhiệt độ (°C)</th>
            <th>Độ ẩm (%)</th>
            <th>Thời gian</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>{item.temperature.toFixed(2)} °C</td>
              <td>{item.humidity} %</td>
              <td>{format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Phân trang */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}>
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default DHT11Data;
