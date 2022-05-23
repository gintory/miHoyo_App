import axios from 'axios'
import { notification } from 'antd';

//作请求使用此函数，返回Promise
export function request (config) {
  const http = axios.create({
    //axios全局配置，bashURL设置代理
    // baseURL: 'http://59.68.29.103:1114/api/1.0/',
    baseURL: 'http://localhost:3000/',
    // baseURL: 'https://www.znglzx.com/api/1.0/',
    timeout: 30000
  });
  // if (config.url != '/user/userLogin') {
  //   if (!localStorage.getItem('sessionId'))
  //     Router.push('/');
  // }
  return http(config);
}

export async function post(config, successCb, history, cb = null) {
  const rawData = await request({ ...config, method: 'post' });
  const data = rawData.data;
  switch (data.code) {
    case 200:
      console.log('here')
      successCb(data);
      break;
    case 'E01':
      notification.error({
        description: '您的会话已经过期，请重新登录',
        message: '警告',
        duration: 1,
        onClose: () => {
          if (history) {
            history.push('/login');
          }
        }
      })
      return Promise.reject('Session Check Fail');
    case 'E02':
      data.contents = {
        list:[],
        size:0
      }
      successCb(data);
      break;
    default:
      break;
  }
  if (cb) cb(data);
}
