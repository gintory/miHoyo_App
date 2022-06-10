import axios from 'axios'
import { notification } from 'antd'

export function request(config) {
  const http = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 30000
  });
  return http(config);
}