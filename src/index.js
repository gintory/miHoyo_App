import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RouteConfig from './router/index';
import 'antd/dist/antd.css';
import reducer from './store/index';
import { createStore } from 'redux';
import { Provider } from 'react-redux';

const store = createStore(reducer);

ReactDOM.render(
  <Provider store={ store }>
    <RouteConfig />
  </Provider>,
  document.getElementById('root')
);
