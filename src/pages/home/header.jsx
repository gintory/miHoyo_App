import React, { useState } from 'react'
import { Menu, Dropdown, notification, Modal, Button, Form, Input } from 'antd';
import { MenuFoldOutlined, AppstoreOutlined, MailOutlined, UserOutlined ,MenuUnfoldOutlined} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { post } from '../../network/request';
const { SubMenu } = Menu;

export default function Header(props){
    const location = useLocation();
    //管理员菜单
    const ManagerMenuList = [
        {
            title: '图片1',
            key: 'sub1',
            children: [
                {
                    title: '图片',
                    key: 'picShow'
                }
            ]
        },
        {
            title: '图片管理',
            key: 'sub2',
            children: [
                {
                    title: '图片管理',
                    key: 'picResume'
                }
            ]
        }
    ]
    //用户菜单
    const UserMenuList = [
        {
            title: '图片2',
            key: 'sub1',
            children: [
                {
                    title: '图片展示',
                    key: 'picShow'
                }
            ]
        },
        {
            title: '图片上传',
            key: 'sub3',
            children: [
                {
                    title: '图片上传',
                    key: 'picUpload'
                }
            ]
        }
    ]

    function handleMenuClick(event) {
        console.log(event)
        console.log(this)
        // props.history.push(`/home/${event.key}`);
    }
    
    function getMenuList() {
        //roleSid的值标识了用户的类型，1为管理员，2为教师，3为学生
        let roleSid = JSON.parse(localStorage.userInfo).roleSid;
        // roleSid = 2;
        switch(roleSid) {
          case 1:
            return ManagerMenuList;
          case 2:
            return UserMenuList;
          default:
            notification.error({
              description: '您的会话已经过期，请重新登录',
              message: '警告',
              duration: 1,
              onClose: () => {
                props.history.push('/');
              }
            });
        }
    }

    //生成菜单元素
    function returnMenu() {
        //获得菜单列表
        const list = getMenuList();
        return (
            list.map(item =>
            <SubMenu
                key = { item.key }
                title = { <span>{item.title}</span> }
            >
                { item.children && item.children.map(item => <Menu.Item key={ item.key }>{item.title}</Menu.Item>) }
            </SubMenu>)
        )
    }

    return (
        <div className="header">
            <img src='assets/miHoYo_Game.png' alt="" />
            <div className='header_text'>米游社·原神</div>
            <div className="header_menu">
                <Menu
                    // mode = 'inline'
                    style = {{ width: 250}}
                    onClick = { handleMenuClick }
                    // defaultOpenKeys = { getMenuList().map(item => item.key)}
                    defaultSelectedKeys={[location.pathname.split('/')[location.pathname.split('/').length - 1]]} 
                    // defaultSelectedKeys = { 'sub1' } 
                    mode = "horizontal"
                >
                    { returnMenu() }
                </Menu>
            </div>
            <div className="home-content-main">{ props.children }</div>
        </div>
    )
}