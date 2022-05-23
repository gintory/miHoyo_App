import {
  Navigate,
  BrowserRouter as Router,
  Route,
  Routes,
  HashRouter,
  Outlet,
} from "react-router-dom";
import React from "react";

//pages
import Login from "../pages/login/login";
import Home from "../pages/home/home";
// import Header from "../pages/home/header";
import PictureShow from "../pages/User/pictureShow";
import PictureUpload from "../pages/User/pictureUpload";
import PictureResume from "../pages/Manager/pictureResume";
import WaterFall from "../pages/User/waterFall";
import OldWaterFall from "../pages/User/oldWaterFall";
import ChangePassword from "../pages/login/changePassword";

export default class RouteConfig extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />}>
            <Route path="pictureShow" element={<PictureShow />} />
            <Route path="pictureUpload" element={<PictureUpload />} />
            <Route path="pictureResume" element={<PictureResume />} />
            <Route path="waterFall" element={<WaterFall />} />
            <Route path="oldWaterFall" element={<OldWaterFall />} />
            <Route path="changePassword" element={<ChangePassword />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </HashRouter>
    );
  }
}
