const Koa = require('koa');
const Router = require('koa-router');
const Koa_static = require('koa-static');
const path = require('path');
const multer = require('koa-multer');
const body = require('koa-body');
const mysql = require('mysql');
const nodeRSA = require('node-rsa');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  port: '3306',
  database: 'mihoyo'
});
connection.connect();
const fileSqlUrl = 'http://localhost:3000/uploads/';
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../public/uploads'),
  filename: function (req, file, cb) {
    console.log(file);
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

async function getData(sql) {
  return new Promise(function (resolve, reject) {
    connection.query(sql, function (err, result) {
      if (err) {
        console.log('error', err.message);
        return;
      }
      resolve(JSON.parse(JSON.stringify(result)));
    });
  });
}

router.prefix('/api');
router.post('/userLogin', async function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let sql = 'select * from user where userName = "' + config.userName + '" and password = ' + decrypt(config.password);
  let res = await getData(sql);
  if (res.length === 1) {
    data.code = 200;
    data.userId = res[0].userId;
    data.userName = res[0].userName;
    data.userType = res[0].userType;
    data.message = '登陆成功';
  } else {
    let exist = await getData('select * from user where userName = "' + config.userName + '"');
    if (exist.length === 1) {
      data.code = 201;
      data.message = '密码错误！';
    } else {
      data.code = 400;
      data.message = '不存在的账号！';
    }
  }
  ctx.response.body = { data };
});
router.post('/register', async function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let sql = 'select * from user where userName = "' + config.userName + '"';
  let res = await getData(sql);
  if (res.length === 0) {
    sql =
      'insert into user(userName, password, userType) values ("' +
      config.userName +
      '", "' +
      decrypt(config.password) +
      '", 2)';
    await getData(sql);
    data.code = 200;
    data.message = '注册成功';
  } else {
    data.code = 201;
    data.message = '账号已存在';
  }
  ctx.response.body = { data };
});
router.post('/changePassword', async function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let sql =
    'select * from user where userId = ' + config.userId + ' and password = "' + decrypt(config.oldPassword) + '"';
  let res = await getData(sql);
  if (res.length != 1) {
    data.code = 201;
    data.message = '密码错误！';
  } else {
    sql = 'update user set password = "' + decrypt(config.newPassword) + '" where userId = ' + config.userId;
    res = await getData(sql);
    data.code = 200;
    data.message = '修改成功！';
  }
  ctx.response.body = { data };
});
router.get('/getPicture', async function (ctx, next) {
  let data = {};
  let sql =
    'select A.*, U.userName from article as A left join user as U on A.userId = U.userId where A.articleState = 2 order by A.articleType desc';
  let res = await getData(sql);
  if (res.length > 0) {
    data.code = 200;
    data.content = res;
  } else {
    data.code = 204;
    data.message = 'No content';
  }
  ctx.response.body = { data };
});
router.get('/getAllPicture', async function (ctx, next) {
  let data = {};
  let sql =
    'select A.*, U.userName from article as A left join user as U on A.userId = U.userId order by A.articleType desc';
  let res = await getData(sql);
  if (res.length > 0) {
    data.code = 200;
    data.content = res;
  } else {
    data.code = 204;
    data.message = 'No content';
  }
  ctx.response.body = { data };
});
router.post('/uploadPicture', imageUploader.single('file'), async (ctx, next) => {
  const file = ctx.request.files.file;
  let fileName = fileSqlUrl + path.basename(file.path);
  let data = {
    code: 200,
    url: fileName,
    message: '上传成功！'
  };
  ctx.response.body = { data };
});
router.post('/uploadArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let title = "'" + config.articleTitle + "'";
  let userId = config.userId;
  let fileLists = config.articlePictures;
  let multi = false;
  let sql = 'insert into article(articleTitle, userId, picUrl, articleState, articleType, picWidth, picHeight) values ';
  fileLists.forEach(async function (file) {
    let item = [title, userId, "'" + file.picFinalUrl + "'", 1, 1, file.width, file.height].join(',');
    if (multi) {
      sql += ',';
    } else {
      multi = !multi;
    }
    sql = sql + '(' + item + ')';
  });
  await getData(sql);
  let data = {
    code: 200,
    message: '发表成功！'
  };
  ctx.response.body = { data };
});
router.post('/deleteArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let airticleId = config.articleId;
  let sql = 'delete from article where articleId = ' + airticleId;
  let res = await getData(sql);
  let data = {
    code: 200,
    message: '删除成功！'
  };
  ctx.response.body = { data };
});
router.post('/updateArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let sql =
    'update article set articleState = ' +
    config.articleState +
    ', articleType = ' +
    config.articleType +
    ' where articleId = ' +
    config.articleId;
  let res = await getData(sql);
  let data = {
    code: 200,
    message: '修改成功！'
  };
  ctx.response.body = { data };
});

app.use(router.routes()).use(router.allowedMethods());
app.listen('3007', (err) => {
  if (err) {
    console.log('服务器失败');
  } else {
    console.log('服务器启动成功:地址为:http://localhost:3007');
  }
});
