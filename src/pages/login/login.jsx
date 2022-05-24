import React, { useState } from 'react'
import { request } from '../../network/request'
import { notification, Button, Tabs, Input } from 'antd'
import { useNavigate } from 'react-router-dom'
import './login.css'

export default function Login(props) {
  const navigate = useNavigate()
  const { TabPane } = Tabs
  const [loginInfo, setLoginInfo] = useState({
    userName: '',
    password: ''
  })
  const [registerInfo, setRegisterInfo] = useState({
    userName: '',
    password: '',
    confirmPassword: ''
  })
  const myMenu = () => (
    <div className="login-content">
      <Tabs defaultActiveKey="1" tabPosition="top">
        <TabPane tab="登录" key="1">
          <div className="login_form">
            <div className="login_form_item">
              <span className="login_form_span">账号：</span>
              <Input
                className="login_form_input"
                value={loginInfo.userName}
                onChange={handleInputChange}
                name="userName"
              ></Input>
            </div>
            <div className="login_form_item">
              <span className="login_form_span">密码：</span>
              <Input
                className="login_form_input"
                type="password"
                value={loginInfo.password}
                onChange={handleInputChange}
                name="password"
              ></Input>
            </div>
            <Button className="login_form_btn" type="primary" onClick={handleLogin}>
              登录
            </Button>
          </div>
        </TabPane>
        <TabPane tab="注册" key="2">
          <div className="login_form">
            <div className="login_form_item">
              <span className="login_form_span">账号：</span>
              <Input
                className="login_form_input"
                value={registerInfo.userName}
                onChange={handleRegisterInputChange}
                name="userName"
              ></Input>
            </div>
            <div className="login_form_item">
              <span className="login_form_span">密码：</span>
              <Input
                className="login_form_input"
                type="password"
                value={registerInfo.password}
                onChange={handleRegisterInputChange}
                name="password"
              ></Input>
            </div>
            <div className="login_form_item">
              <span className="login_form_span">确认密码：</span>
              <Input
                className="login_form_input"
                type="password"
                value={registerInfo.confirmPassword}
                onChange={handleRegisterInputChange}
                name="confirmPassword"
              ></Input>
            </div>
            <Button className="login_form_btn" type="primary" onClick={handleRegister}>
              注册
            </Button>
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
  async function handleLogin() {
    const res = await request({
      url: '/api/userlogin',
      method: 'post',
      data: loginInfo
    })
    let data = res.data.data
    console.log(data)
    if (data.code === 200) {
      setLoginInfo({
        userName: '',
        password: ''
      })
      localStorage.setItem('userId', data.userId)
      localStorage.setItem('userName', data.userName)
      localStorage.setItem('userType', data.userType)
      navigate('/home/picture-show')
    } else {
      notification.error({
        description: data.message,
        message: '警告',
        duration: 2
      })
    }
  }
  async function handleRegister() {
    if (check()) {
      const res = await request({
        url: '/api/register',
        method: 'post',
        data: registerInfo
      })
      let data = res.data.data
      console.log(data)
      if (data.code === 200) {
        notification.success({
          description: '注册成功！',
          message: '通知',
          duration: 2,
          onClose: () => {}
        })
      } else if (data.code === 201) {
        notification.error({
          description: '账号已存在，请重新输入！',
          message: '警告',
          duration: 2
        })
      }
      setRegisterInfo({
        userName: '',
        password: '',
        confirmPassword: ''
      })
    }
  }
  function check() {
    if (registerInfo.password !== registerInfo.confirmPassword) {
      notification.error({
        description: '两次密码不一致，请重新输入！',
        message: '警告',
        duration: 2
      })
      setRegisterInfo({
        userName: '',
        password: '',
        confirmPassword: ''
      })
      return false
    } else {
      return true
    }
  }
  function handleInputChange(event) {
    const value = event.target.value
    setLoginInfo({ ...loginInfo, [event.target.name]: value })
  }
  function handleRegisterInputChange(event) {
    const value = event.target.value
    setRegisterInfo({ ...registerInfo, [event.target.name]: value })
  }

  return (
    <div className="login">
      <div className="login_header">
        <img className="login_header_img" src="assets/miHoYo_Logo.png" alt="" />
      </div>
      {myMenu()}
    </div>
  )
}
