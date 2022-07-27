import React from 'react'
import { Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
const { SubMenu } = Menu;

export default function Header(props) {
  const location = useLocation();
  const navigate = useNavigate();
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
  ];
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
  ];

  function handleMenuClick(event) {}

  function getMenuList() {
    const roleSid = JSON.parse(localStorage.userInfo).roleSid;
    const MenuMap = {
      1: ManagerMenuList,
      2: UserMenuList
    };
    return MenuMap[roleSid];
  }

  //生成菜单元素
  function returnMenu() {
    //获得菜单列表
    const list = getMenuList();
    return list.map((item) => (
      <SubMenu key={item.key} title={<span>{item.title}</span>}>
        {item.children && item.children.map((item) => <Menu.Item key={item.key}>{item.title}</Menu.Item>)}
      </SubMenu>
    ));
  }

  return (
    <div className="header">
      <img className="header-img" src="assets/miHoYo_Game.png" alt="" />
      <div className="header-text">米游社·原神</div>
      <div className="header-menu">
        <Menu
          onClick={handleMenuClick}
          defaultSelectedKeys={[location.pathname.split('/')[location.pathname.split('/').length - 1]]}
          mode="horizontal"
        >
          {returnMenu()}
        </Menu>
      </div>
      <div className="home-content-main">{props.children}</div>
    </div>
  );
}
