import React from 'react';
import './profile.css';
import avatar from './imgs/avatar.jpg';
const Profile = () => {
  const profileData = {
    name: 'Dương Xuân Đạt',
    dob: '11/11/2002',
    email: 'Duongdat75k@gmail.com',
    address: 'Bắc Giang',
    phoneNumber: '0354384621',
  }  ;

  return (
    <div className='profile-content'>
    <div>
      <h1>Thông tin cá nhân</h1>
      <img src={avatar} className='avatar' alt='Ảnh đại diện'></img>
      <ul>
        <li>
          <strong>Tên:</strong> {profileData.name}
        </li>
        <li>
          <strong>Ngày sinh:</strong> {profileData.dob}
        </li>
        <li>
          <strong>Email:</strong> {profileData.email}
        </li>
        <li>
          <strong>Địa chỉ:</strong> {profileData.address}
        </li>
        <li>
          <strong>Số điện thoại:</strong> {profileData.phoneNumber}
        </li>
      </ul>
    </div>
    </div>
  );
};

export default Profile;