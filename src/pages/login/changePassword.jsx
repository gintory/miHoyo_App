import React, { useState } from 'react'
import { request } from '../../network/request'
import { notification, Button, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import { encrypt } from '../../components/encrypt';
import './changePassword.css';

export default function ChangePassword(props) {
  const navigate = useNavigate();
  const [filterInfo, setFilterInfo] = useState({
    oldPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  function handleChangePassword() {
    if (check()) {
      let data = {
        userId: Number(localStorage.getItem('userId')),
        oldPassword: encrypt(filterInfo.oldPassword),
        newPassword: encrypt(filterInfo.newPassword)
      };
      request({
        url: '/api/changePassword',
        method: 'post',
        data: data
      }).then((val) => {
        if (val.data.data.code === 200) {
          notification.success({
            description: '修改成功！',
            message: '通知',
            duration: 2,
            onClose: () => {}
          });
          navigate('/home/picture-show');
        } else if (val.data.data.code === 201) {
          notification.error({
            description: '密码错误，请重新输入！',
            message: '警告',
            duration: 2
          });
        }
        setFilterInfo({
          oldPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      });
    }
  }
  function handleInputChange(event) {
    const value = event.target.value;
    setFilterInfo({ ...filterInfo, [event.target.name]: value });
  }
  function check() {
    if (filterInfo.newPassword !== filterInfo.confirmNewPassword) {
      notification.error({
        description: '两次密码不一致，请重新输入！',
        message: '警告',
        duration: 2
      });
      setFilterInfo({
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
      return false;
    } else {
      return true;
    }
  }

  return (
    <div className="changePassword">
      <div className="changePassword-content">
        <div className="upload-header">修改密码</div>
        <div className="change-form">
          <div className="change-form-item">
            <span className="change-form-span">当前密码：</span>
            <Input
              className="change-form-input"
              type="password"
              value={filterInfo.oldPassword}
              onChange={handleInputChange}
              name="oldPassword"
            ></Input>
          </div>
          <div className="change-form-item">
            <span className="change-form-span">修改密码：</span>
            <Input
              className="change-form-input"
              type="password"
              value={filterInfo.newPassword}
              onChange={handleInputChange}
              name="newPassword"
            ></Input>
          </div>
          <div className="change-form-item">
            <span className="change-form-span">确认修改密码：</span>
            <Input
              className="change-form-input"
              type="password"
              value={filterInfo.confirmNewPassword}
              onChange={handleInputChange}
              name="confirmNewPassword"
            ></Input>
          </div>
          <Button type="primary" onClick={handleChangePassword}>
            确认修改
          </Button>
        </div>
      </div>
    </div>
  );
}
