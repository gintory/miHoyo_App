import { Route, Routes, HashRouter, BrowserRouter } from 'react-router-dom';
import React from 'react';

//pages
import Login from '../pages/login/login';
import Home from '../pages/home/home';
import PictureShow from '../pages/User/pictureShow';
import PictureUpload from '../pages/User/pictureUpload';
import PictureResume from '../pages/Manager/pictureResume';
import WaterFall from '../pages/User/waterFall';
import ChangePassword from '../pages/login/changePassword';
export default class RouteConfig extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />}>
            <Route path="picture-show" element={<PictureShow />} />
            <Route path="picture-upload" element={<PictureUpload />} />
            <Route path="picture-resume" element={<PictureResume />} />
            <Route path="water-fall" element={<WaterFall />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
