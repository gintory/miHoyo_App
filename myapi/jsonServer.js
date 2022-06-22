const articleData = require('../data/article.json');
const userData = require('../data/user.json');
const Koa = require('koa');
const Router = require('koa-router');
const Koa_static = require('koa-static');
const path = require('path');
const multer = require('koa-multer');
const fs = require('fs');
const body = require('koa-body');
const nodeRSA = require('node-rsa');

const fileSqlUrl = 'http://localhost:3000/uploads/';
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../public/uploads'),
  filename: function (req, file, cb) {
    const fileFormat = file.originalname.split('.');
    cb(null, Date.now() + '.' + fileFormat[fileFormat.length - 1]);
  }
});
const fileFilter = function (req, file, cb) {
  const acceptableMime = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (acceptableMime.indexOf(file.mimetype) !== -1) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const limits = {
  fileSize: '10MB'
};
const imageUploader = multer({
  fileFilter,
  storage,
  limits
});
const priKey = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCKoqw0AfDnmVubjWqCFEKxyWAmGrt7M95G9barVZt6vQu2msZE
lEgAegVNHjKfquqYjEn5cNTD9g2jaTI36mu4ffGHSXoyulCteLWwIXU7fl4BcPBl
GwnZldUJRClDc1yP88/ZhOUSny9pX903r/YPLfntXyUNDTl8ikEFR0A6MQIDAQAB
AoGAGTRoEHCF5uVn1UkJoyqh0YbmFydnDIgqkkYb9txyjwcNuR48i71Vtdh5XELw
Oz0st51R2arc09/JLPt0KNxSxwxWVH7FEh10hl0ent7EEddcsM0ws8wuyiMqo8XL
5hiejRIjbO8+bd7DJZjWFmz90WXkBvfdG2LWw6LLRykX5v0CQQDK2X43tKdrAlZa
ikSlzJd+RyMxLWFds0nNPtRaLAamxfgXqHisMc6n71jlyiv/YoGYJflKV2d9tq3t
+jxJjHzjAkEArvXmBj5GF/eQbWiW4CBYTC37qlGzQd6k4h3IGhozyR18aHyRHC2w
AyyiPCjvDD/3TOAeBfoHyybLvaq3G2pM2wJAeVgJrQEgdV78kUTNM/FjXmLnpm9j
I04xA9pl5VsYz4L1mhFpvng9CzCemTeLgkZHB+EPc209t3IkMYvTrJuhyQJAIImi
ia6zImnr9izpQi1BvokesIIZMDrTtymKuS/+SXyuUlA4PGFSxoRad421RzXuK+HS
M5JYOLOyWEeTXgna2QJAO2mkDs6h7BHgB2SujX+cTdAtzqp19GycwRkKQiE8QaY+
DwPT74M/um/1tzjSmLzCg2uJIS4M88iGvnTAyLa8Og==
-----END RSA PRIVATE KEY-----`;
const privateKey = new nodeRSA(priKey);
privateKey.setOptions({ encryptionScheme: 'pkcs1' });
const decrypt = function (rsaPassWord) {
  return privateKey.decrypt(rsaPassWord, 'utf8');
};
const app = new Koa();
const router = new Router();
app
  .use(
    body({
      multipart: true,
      formidable: {
        uploadDir: path.join(__dirname, '../public/uploads'),
        keepExtensions: true
      }
    })
  )
  .use(Koa_static(__dirname, 'public'));

router.prefix('/api');
router.post('/userLogin', function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  config.password = decrypt(config.password);
  let findUser = userData.RECORDS.find(
    (item) => item.userName === config.userName && item.password === config.password
  );
  if (findUser) {
    data.code = 200;
    data.userId = findUser.userId;
    data.userName = findUser.userName;
    data.userType = findUser.userType;
    data.message = '登陆成功';
  } else {
    let existUser = userData.RECORDS.find((item) => item.userName === config.userName);
    if (existUser) {
      data.code = 201;
      data.message = '密码错误！';
    } else {
      data.code = 400;
      data.message = '不存在的账号！';
    }
  }
  ctx.response.body = { data };
});
router.post('/register', function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let res = userData.RECORDS.find((item) => item.userName === config.userName);
  if (!res) {
    let newUser = {
      userId: userData.RECORDS[userData.RECORDS.length - 1].userId + 1,
      userName: config.userName,
      password: decrypt(config.password),
      userType: 2
    };
    userData.RECORDS.push(newUser);
    fs.writeFile('data/user.json', JSON.stringify(userData), (err) => {});
    data.code = 200;
    data.message = '注册成功';
  } else {
    data.code = 201;
    data.message = '账号已存在';
  }
  ctx.response.body = { data };
});
router.post('/changePassword', function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let findUser = userData.RECORDS.find(
    (item) => item.userId === Number(config.userId) && item.password === decrypt(config.oldPassword)
  );
  if (!findUser) {
    data.code = 201;
    data.message = '密码错误！';
  } else {
    findUser.password = decrypt(config.newPassword);
    fs.writeFile('data/user.json', JSON.stringify(userData), (err) => {});
    data.code = 200;
    data.message = '修改成功！';
  }
  ctx.response.body = { data };
});
router.get('/getPicture', function (ctx, next) {
  let data = {};
  let filterData = articleData.RECORDS.filter((item) => {
    return item.articleState === 2;
  });
  filterData.sort((a, b) => b.articleType - a.articleType);
  filterData.forEach((item) => {
    let findUser = userData.RECORDS.find((user) => user.userId === item.userId);
    item.userName = findUser.userName;
  });
  if (filterData) {
    data.code = 200;
    data.content = filterData;
  } else {
    data.code = 204;
    data.message = 'No content';
  }
  ctx.response.body = { data };
});
router.get('/getAllPicture', function (ctx, next) {
  let data = {};
  let tableData = JSON.parse(JSON.stringify(articleData.RECORDS));
  tableData.sort((a, b) => b.articleType - a.articleType);
  tableData.forEach((item) => {
    let findUser = userData.RECORDS.find((user) => user.userId === item.userId);
    item.userName = findUser.userName;
  });
  if (tableData.length > 0) {
    data.code = 200;
    data.content = tableData;
  } else {
    data.code = 204;
    data.message = 'No content';
  }
  ctx.response.body = { data };
});
router.post('/uploadPicture', imageUploader.single('file'), (ctx, next) => {
  const file = ctx.request.files.file;
  let fileName = fileSqlUrl + path.basename(file.path);
  let data = {
    code: 200,
    url: fileName,
    message: '上传成功！'
  };
  console.log('upload pic!');
  ctx.response.body = { data };
});
router.post('/uploadArticle', function (ctx, next) {
  const config = ctx.request.body;
  let title = config.articleTitle;
  let userId = config.userId;
  let fileLists = config.articlePictures;
  fileLists.forEach(function (file) {
    let newArticle = {
      articleId: articleData.RECORDS[articleData.RECORDS.length - 1].articleId + 1,
      articleTitle: title,
      userId: userId,
      picUrl: file.picFinalUrl,
      articleType: 1,
      articleState: 1,
      picWidth: file.width,
      picHeight: file.height
    };
    articleData.RECORDS.push(newArticle);
  });
  fs.writeFile('data/article.json', JSON.stringify(articleData), (err) => {});
  let data = {
    code: 200,
    message: '发表成功！'
  };
  console.log('upload article!');
  ctx.response.body = { data };
});
router.post('/deleteArticle', function (ctx, next) {
  const config = ctx.request.body;
  let articleId = config.articleId;
  let findArticle = articleData.RECORDS.find((item) => item.articleId === articleId);
  let index = articleData.RECORDS.indexOf(findArticle);
  articleData.RECORDS.splice(index, 1);
  fs.writeFile('data/article.json', JSON.stringify(articleData), (err) => {});
  let data = {
    code: 200,
    message: '删除成功！'
  };
  ctx.response.body = { data };
});
router.post('/updateArticle', function (ctx, next) {
  const config = ctx.request.body;
  let findArticle = articleData.RECORDS.find((item) => item.articleId === config.articleId);
  let index = articleData.RECORDS.indexOf(findArticle);
  findArticle.articleState = config.articleState;
  findArticle.articleType = config.articleType;
  fs.writeFile('data/article.json', JSON.stringify(articleData), (err) => {});
  let data = {
    code: 200,
    message: '修改成功！'
  };
  ctx.response.body = { data };
});

app.use(router.routes()).use(router.allowedMethods());
app.listen('3006', (err) => {
  if (err) {
    console.log('服务器失败');
  } else {
    console.log('服务器启动成功:地址为:http://localhost:3006');
  }
});
