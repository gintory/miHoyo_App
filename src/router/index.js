import { Route, Routes, HashRouter } from 'react-router-dom'
import React from 'react'

//pages
import Login from '../pages/login/login'
import Home from '../pages/home/home'
// import Header from "../pages/home/header";
import PictureShow from '../pages/User/pictureShow'
import PictureUpload from '../pages/User/pictureUpload'
import PictureResume from '../pages/Manager/pictureResume'
import WaterFall from '../pages/User/waterFall'
// import OldWaterFall from '../pages/User/oldWaterFall'
import ChangePassword from '../pages/login/changePassword'

export default class RouteConfig extends React.Component {
  render() {
    return (
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />}>
            <Route path="picture-show" element={<PictureShow />} />
            <Route path="picture-upload" element={<PictureUpload />} />
            <Route path="picture-resume" element={<PictureResume />} />
            <Route path="water-fall" element={<WaterFall />} />
            {/* <Route path="oldWaterFall" element={<OldWaterFall />} /> */}
            <Route path="change-password" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </HashRouter>
    )
  }
}
