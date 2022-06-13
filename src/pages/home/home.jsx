import React from 'react'
import { Menu, Dropdown, notification } from 'antd'
import { UserOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { useLocation, Outlet, NavLink, useNavigate } from 'react-router-dom'
import './home.css'
import './header.css'

// const { SubMenu } = Menu

export default function Home(props) {
  const location = useLocation();
  const navigate = useNavigate();
  //管理员菜单
  const ManagerMenuList = [
    {
      title: '图片',
      key: 'pictureShow',
      url: 'picture-show'
    },
    {
      title: '图片瀑布流',
      key: 'waterFall',
      url: 'water-fall'
    },
    {
      title: '图片上传',
      key: 'pictureUpload',
      url: 'picture-upload'
    },
    {
      title: '图片管理',
      key: 'pictureResume',
      url: 'picture-resume'
    }
  ];
  //用户菜单
  const UserMenuList = [
    {
      title: '图片',
      key: 'pictureShow',
      url: 'picture-show'
    },
    {
      title: '图片瀑布流',
      key: 'waterFall',
      url: 'water-fall'
    },
    {
      title: '图片上传',
      key: 'pictureUpload',
      url: 'picture-upload'
    }
  ];
  const loginMenu = (
    <Menu>
      <Menu.Item key="login_changePassword">
        <span onClick={handleOpenChangePasswordDialog}>修改密码</span>
      </Menu.Item>
      <Menu.Item key="login_out">
        <span onClick={handleLoginOut}>退出登录</span>
      </Menu.Item>
    </Menu>
  );

  function handleMenuClick(event) {
    const menuDom = document.getElementsByClassName('header-menu-mobile')[0];
    menuDom.style.display = 'none';
  }

  function getMenuList() {
    //userType的值标识了用户的类型，1为管理员，2为用户
    let userType = Number(localStorage.getItem('userType'));
    const MenuMap = {
      1: () => {
        return ManagerMenuList;
      },
      2: () => {
        return UserMenuList;
      }
    };
    const handle = MenuMap[userType];
    if (handle) {
      return handle();
    } else {
      return handle;
    }
  }
  function handleOpenChangePasswordDialog() {
    navigate('/home/change-password');
  }
  function handleLoginOut() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userType');
    navigate('/');
  }
  //生成菜单元素
  function renderMenu() {
    //获得菜单列表
    const list = getMenuList();
    if (list) {
      return list.map((item) => (
        <Menu.Item className="submenu" key={item.key}>
          <NavLink to={item.url}>
            <span>{item.title}</span>
          </NavLink>
        </Menu.Item>
      ));
    } else {
      navigate('/');
    }
  }
  function getSelectedKey() {
    const title = [location.pathname.split('/')[location.pathname.split('/').length - 1]];
    return title;
  }
  function openMenu() {
    const menuDom = document.getElementsByClassName('header-menu-mobile')[0];
    if (menuDom.style.display === 'block') {
      menuDom.style.display = 'none';
    } else {
      menuDom.style.display = 'block';
    }
  }

  return (
    <div className="home">
      <div className="header">
        <img className="header-img" src="assets/miHoYo_Game.png" alt="" />
        <div className="header-text">米游社·原神</div>
        <div className="header-menu">
          <Menu style={{ width: 250 }} selectedKeys={getSelectedKey()} mode="horizontal">
            {renderMenu()}
          </Menu>
        </div>
        <div className="header-menu-mobile-btn" onClick={openMenu}>
          <MenuUnfoldOutlined />
        </div>
        <div className="header-user">
          <Dropdown.Button overlay={loginMenu} placement="bottom" icon={<UserOutlined />}>
            {localStorage.getItem('userName')}
          </Dropdown.Button>
        </div>
      </div>
      <div className="header-menu-mobile">
        <Menu mode="inline" style={{ width: 250 }} onClick={handleMenuClick} selectedKeys={getSelectedKey()}>
          {renderMenu()}
        </Menu>
      </div>
      <div className="home-content-main" id="home-content-main">
        <Outlet></Outlet>
      </div>
    </div>
  );
}
