import React, { useState } from 'react'
import { request } from '../../network/request'
import { notification, Button, Tabs, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import { encrypt } from '../../components/encrypt';
import './login.css';

export default function Login(props) {
  const navigate = useNavigate();
  const { TabPane } = Tabs;
  const [loginInfo, setLoginInfo] = useState({
    userName: '',
    password: ''
  });
  const [registerInfo, setRegisterInfo] = useState({
    userName: '',
    password: '',
    confirmPassword: ''
  });
  const renderMenu = () => (
    <div className="login-content">
      <Tabs defaultActiveKey="1" tabPosition="top">
        <TabPane tab="登录" key="1">
          <div className="login-form">
            <div className="login-form-item">
              <span className="login-form-span">账号：</span>
              <Input
                className="login-form-input"
                value={loginInfo.userName}
                onChange={handleInputChange}
                name="userName"
              ></Input>
            </div>
            <div className="login-form-item">
              <span className="login-form-span">密码：</span>
              <Input
                className="login-form-input"
                type="password"
                value={loginInfo.password}
                onChange={handleInputChange}
                name="password"
              ></Input>
            </div>
            <Button className="login-form-btn" type="primary" onClick={handleLogin}>
              登录
            </Button>
          </div>
        </TabPane>
        <TabPane tab="注册" key="2">
          <div className="login-form">
            <div className="login-form-item">
              <span className="login-form-span">账号：</span>
              <Input
                className="login-form-input"
                value={registerInfo.userName}
                onChange={handleRegisterInputChange}
                name="userName"
              ></Input>
            </div>
            <div className="login-form-item">
              <span className="login-form-span">密码：</span>
              <Input
                className="login-form-input"
                type="password"
                value={registerInfo.password}
                onChange={handleRegisterInputChange}
                name="password"
              ></Input>
            </div>
            <div className="login-form-item">
              <span className="login-form-span">确认密码：</span>
              <Input
                className="login-form-input"
                type="password"
                value={registerInfo.confirmPassword}
                onChange={handleRegisterInputChange}
                name="confirmPassword"
              ></Input>
            </div>
            <Button className="login-form-btn" type="primary" onClick={handleRegister}>
              注册
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
  function handleLogin() {
    if (!loginInfo.userName.length || !loginInfo.password.length) {
      notification.error({
        description: '账号或密码不能为空！',
        message: '警告',
        duration: 2
      });
      return;
    }
    request({
      url: '/api/userLogin',
      method: 'post',
      data: {
        userName: loginInfo.userName,
        password: encrypt(loginInfo.password)
      }
    }).then((val) => {
      if (val.data.data.code === 200) {
        setLoginInfo({
          userName: '',
          password: ''
        });
        localStorage.setItem('userId', val.data.data.userId);
        localStorage.setItem('userName', val.data.data.userName);
        localStorage.setItem('userType', val.data.data.userType);
        navigate('/home/picture-show');
      } else {
        notification.error({
          description: val.data.data.message,
          message: '警告',
          duration: 2
        });
      }
    });
  }
  function handleRegister() {
    if (check()) {
      request({
        url: '/api/register',
        method: 'post',
        data: {
          userName: registerInfo.userName,
          password: encrypt(registerInfo.password)
        }
      }).then((val) => {
        if (val.data.data.code === 200) {
          notification.success({
            description: '注册成功！',
            message: '通知',
            duration: 2,
            onClose: () => {}
          });
        } else if (val.data.data.code === 201) {
          notification.error({
            description: '账号已存在，请重新输入！',
            message: '警告',
            duration: 2
          });
        }
        setRegisterInfo({
          userName: '',
          password: '',
          confirmPassword: ''
        });
      });
    }
  }
  function check() {
   if (!registerInfo.userName.length || !registerInfo.password.length || !registerInfo.confirmPassword.length) {
     notification.error({
       description: '账号和密码不能为空，请重新输入！',
       message: '警告',
       duration: 2
     });
     return false;
   } else if (registerInfo.password !== registerInfo.confirmPassword) {
     notification.error({
       description: '两次密码不一致，请重新输入！',
       message: '警告',
       duration: 2
     });
     setRegisterInfo({
       userName: '',
       password: '',
       confirmPassword: ''
     });
     return false;
   } else {
     return true;
   }
  }
  function handleInputChange(event) {
    const value = event.target.value;
    setLoginInfo({ ...loginInfo, [event.target.name]: value });
  }
  function handleRegisterInputChange(event) {
    const value = event.target.value;
    setRegisterInfo({ ...registerInfo, [event.target.name]: value });
  }

  return (
    <div className="login">
      <div className="login-header">
        <img className="login-header-img" src="assets/miHoYo_Logo.png" alt="" />
      </div>
      {renderMenu()}
    </div>
  );
}
