import React, { useState, createRef, useRef } from 'react'
import { Menu, Dropdown, notification, Modal, Button, Form, Input } from 'antd';
import { MenuFoldOutlined, AppstoreOutlined, MailOutlined, UserOutlined ,MenuUnfoldOutlined} from '@ant-design/icons';
import { Link, useLocation, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { post } from '../../network/request';
import './home.css';
import './header.css'

const { SubMenu } = Menu;

export default function Home(props) {
    // console.log('HOME here',props);
    const location = useLocation();
    const navigate = useNavigate();

    //管理员菜单
    const ManagerMenuList = [
        {
            title: '图片',
            key: 'pictureShow',
            url: 'pictureShow',
        },
        {
            title: '图片瀑布流',
            key: 'waterFall',
            url: 'waterFall',
        },
        {
            title: '图片上传',
            key: 'pictureUpload',
            url: 'pictureUpload',
        },
        {
            title: '图片管理',
            key: 'pictureResume',
            url: 'pictureResume',
        },
    ]
    //用户菜单
    const UserMenuList = [
        {
            title: '图片',
            key: 'pictureShow',
            url: 'pictureShow',
        },
        {
            title: '图片瀑布流',
            key: 'waterFall',
            url: 'waterFall',
        },
        {
            title: '图片上传',
            key: 'pictureUpload',
            url: 'pictureUpload',
        },
    ]
    const loginMenu = (
        <Menu>
          <Menu.Item key='login_changePassword'>
            <span onClick={ handleOpenChangePasswordDialog }>修改密码</span>
          </Menu.Item>
          <Menu.Item key='login_out'>
            <span onClick={ handleLoginOut }>退出登录</span>
          </Menu.Item>
        </Menu>
    )

    function handleMenuClick(event) {
        let menuDom = document.getElementsByClassName('header_menu_mobile')[0];
        menuDom.style.display = 'none';
    }
    
    function getMenuList() {
        //userType的值标识了用户的类型，1为管理员，2为用户
        let userType = parseInt(localStorage.getItem('userType'));
        switch(userType) {
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
                navigate('/');
              }
            });
        }
    }

    function handleOpenChangePasswordDialog(){
        navigate('/home/changePassword');
    }

    function handleLoginOut(){
        localStorage.removeItem('userId')
        localStorage.removeItem('userName')
        localStorage.removeItem('userType')
        navigate('/');
    }

    //生成菜单元素
    function returnMenu() {
        //获得菜单列表
        const list = getMenuList();
        return (
            list.map(item =>
            <Menu.Item
                className = 'submenu'
                key = { item.key }
            >
                <NavLink to={item.url}><span>{item.title}</span></NavLink> 
            </Menu.Item>)
        )
    }
    function getSelected(){
        let title = [location.pathname.split('/')[location.pathname.split('/').length - 1]]
        return title
    }
    function openMenu(){
        let menuDom = document.getElementsByClassName('header_menu_mobile')[0];
        if(menuDom.style.display == 'block'){
            menuDom.style.display = 'none'
        }else{
            menuDom.style.display = 'block'
        }
    }

    return(
        <div className="home">
            <div className="header">
                <img className='header_img' src='assets/miHoYo_Game.png' alt="" />
                <div className='header_text'>米游社·原神</div>
                <div className="header_menu">
                    <Menu
                        // mode = 'inline'
                        style = {{ width: 250}}
                        selectedKeys = { getSelected() }
                        // defaultSelectedKeys={ [location.pathname.split('/')[location.pathname.split('/').length - 1]] }  
                        mode = "horizontal"
                    >
                        { returnMenu() }
                    </Menu>
                </div>
                <div className="header_menu_mobile_btn" onClick={openMenu}>
                    <MenuUnfoldOutlined />
                </div>
                <div className="header_user">
                    <Dropdown.Button overlay={loginMenu} placement="bottom" icon={<UserOutlined />}>
                        { localStorage.getItem('userName')}
                    </Dropdown.Button>
                </div>
            </div>
            <div className="header_menu_mobile">
                    <Menu
                        mode = 'inline'
                        style = {{ width: 250}}
                        onClick = { handleMenuClick }
                        selectedKeys = { getSelected() }
                    >
                        { returnMenu() }
                    </Menu>
            </div>
            <div className="home_content_main" id="home_content_main">
                <Outlet></Outlet>
            </div>
        </div>
        
    )
}