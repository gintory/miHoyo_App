# miHoyo_App
### 项目启动
项目启动： `npm start`
服务端启动： 
- 使用Json：`npm run myJson`
- 使用mysql：`npm run myApi`

### 账号
- 管理员：admin  密码：123456
- 用户：user  密码：123456

### Json数据
- Json文件位置： `data/article.json` `data/user.json`

### MySQL数据库
- 数据库：`MySQL`
- 数据库连接配置文件位置： `myApi/server.js`
```jsx
host: 'localhost',
user: 'root',
password: '',
port: '3306',
database: 'mihoyo'
```
### 数据字段说明
#### user 用户表
`userId`：用户id
`userName`：用户名
`password`：密码
`userType`：用户类型，1代表管理员，2代表普通用户

#### article 文章表
`articleId`：文章编号
`articleTitle`：文章标题
`userId`：用户Id
`picUrl`：图片地址
`articleType`：文章类型，1代表未置顶，2代表置顶
`articleState`：文章状态，1代表未审核，2代表审核通过，3代表审核未通过
`picWidth`：图片宽度
`picHeight`：图片高度
`position`: 图片排序

