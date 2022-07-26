import axios from 'axios'
import { notification } from 'antd'
let cache = {};
const EXPIRE_TIME = 30000;
const CancelToken = axios.CancelToken;

function getExpireTime() {
  return new Date().getTime();
}
export function request(config) {
  const http = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 30000,
    headers: {
      'Cache-Control': 'max-age=300'
    }
  });
  const interceptorsRequest = (config) => {
    return config;
  };
  const interceptorsResponse = (response) => {
    return response;
  };
  http.interceptors.request.use(interceptorsRequest);
  http.interceptors.response.use(interceptorsResponse);
  return http(config);
}