var Koa = require('koa');
var Router = require('koa-router');
var Koa_static = require('koa-static');
var path = require('path');
const multer = require("koa-multer"); 
const os = require('os');
const fs = require('fs');
const body =  require('koa-body');
const bodyparser =  require('koa-bodyparser');
var mysql = require('mysql');
var _ = require('lodash');
const { fileURLToPath } = require('url');
const { isCompositeComponentWithType } = require('react-dom/test-utils');
var connection = mysql.createConnection({
    host: 'localhost', 
    user: 'root', 
    password: '', 
    port: '3306', 
    database: 'mihoyo'
});
connection.connect(); 
var fileSqlUrl = "http://localhost:3000/uploads/";
var storage = multer.diskStorage({
  destination: path.resolve(__dirname, "../public/uploads"),
  filename: function (req, file, cb) {
    console.log(file)
    var fileFormat = (file.originalname).split(".");
    cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
}
});
var fileFilter = function (req, file, cb) {
  var acceptableMime = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  if (acceptableMime.indexOf(file.mimetype) !== -1) {
    cb(null, true);
  } else {
    cb(null, false); 
  }
};  
var limits = {
  fileSize: "10MB", 
};
const imageUploader = multer({
  fileFilter,
  storage,
  limits,
})
var app = new Koa();
var router = new Router();
app.use(body({ 
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname,"../public/uploads"),
    keepExtensions: true
  } 
}))
   .use(Koa_static(__dirname, 'public'))

async function getData(sql){
  return new Promise(function(resolve,reject){
      connection.query(sql, function (err, result) {
          if (err) {
              console.log('error', err.message);
              return;
          }
          resolve(JSON.parse(JSON.stringify(result)));
      });
  })
}

router.prefix('/api');
router.post('/userlogin', async function (ctx, next) {
    const config = ctx.request.body;
    let data = {};
    let sql = 'select * from user where userName = "' + config.userName + '" and password = ' + config.password;
    let res = await getData(sql);
    if(res.length == 1){
        data.code = 200;
        data.userId = res[0].userId;
        data.userName = res[0].userName;
        data.userType = res[0].userType;
        data.message = '登陆成功';
    }else{
        let exist = await getData('select * from user where userName = "' + config.userName + '"')
        if(exist.length == 1){
            data.code = 201;
            data.message = '密码错误！';
        }else{
            data.code = 400;
            data.message = '不存在的账号！';
        }
    }
    ctx.response.body = {data}
});
router.post('/register', async function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let sql = 'select * from user where userName = "' + config.userName + '"';
  let res = await getData(sql);
  if(res.length == 0){
      sql = 'insert into user(userName, password, userType) values ("' + config.userName + '", "' + config.password + '", 2)'
      console.log('register:',sql)
      let ress = await getData(sql)
      console.log(ress)
      data.code = 200;
      data.message = '注册成功';
  }else{
    data.code = 201;
    data.message = '账号已存在';
  }
  ctx.response.body = {data}
});
router.post('/changePassword', async function (ctx, next) {
  const config = ctx.request.body;
  let data = {};
  let sql = 'select * from user where userId = ' + config.userId + ' and password = "' + config.oldPassword + '"';
  let res = await getData(sql);
  if(res.length!=1){
    data.code = 201;
    data.message = '密码错误！';
  }else{
    sql = 'update user set password = "' + config.newPassword +'" where userId = ' + config.userId;
    res = await getData(sql);
    data.code = 200;
    data.message = '修改成功！';
  }
  ctx.response.body = {data}
});
router.get('/getPicture', async function (ctx, next) {
  let data = {};
  let sql = 'select A.*, U.userName from article as A left join user as U on A.userId = U.userId where A.articleState = 2 order by A.articleType desc';
  let res = await getData(sql);
  if(res.length > 0){
      data.code = 200;
      data.content = res;
  }else{
      data.code = 204;
      data.message = 'No content';
  }
  ctx.response.body = {data};
});
router.get('/getAllPicture', async function (ctx, next) {
  let data = {};
  let sql = 'select A.*, U.userName from article as A left join user as U on A.userId = U.userId order by A.articleType desc';
  let res = await getData(sql);
  if(res.length > 0){
      data.code = 200;
      data.content = res;
  }else{
      data.code = 204;
      data.message = 'No content';
  }
  ctx.response.body = {data};
});
router.post('/uploadPicture', imageUploader.single('file'), async (ctx, next) => {
  const file = ctx.request.files.file;
  let fileName = fileSqlUrl + path.basename(file.path)
  let data = {
    code:200,
    url:fileName,
    message:'上传成功！'
  }
  ctx.response.body = {data};
}); 
router.post('/uploadArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let title = "'" + config.articleTitle + "'"
  let userId = config.userId
  let fileLists = config.articlePictures
  let multi = false
  let sql = 'insert into article(articleTitle, userId, picUrl, articleState, articleType, picWidth, picHeight) values '
  _.forEach(fileLists, async function(file){
    let item = _.join([title, userId, "'"+file.picFinalUrl+"'", 1, 1, file.width, file.height],',')
    if(multi){
      sql += ','
    }else{
      multi = !multi
    }
    sql = sql + '('+ item + ')' 
  })
  console.log('here',sql)
  let res22 = await getData(sql);
  console.log(res22)
  let data = {
    code:200,
    message:'发表成功！'
  };
  ctx.response.body = {data}
});
router.post('/deleteArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let airticleId = config.articleId
  let sql = 'delete from article where articleId = ' + airticleId
  let res = await getData(sql);
  let data = {
    code:200,
    message:'删除成功！'
  };
  ctx.response.body = {data}
});
router.post('/updateArticle', async function (ctx, next) {
  const config = ctx.request.body;
  let sql = 'update article set articleState = '+ config.articleState + ', articleType = ' + config.articleType +' where articleId = ' + config.articleId
  let res = await getData(sql);
  let data = {
    code:200,
    message:'修改成功！'
  };
  ctx.response.body = {data}
});

app.use(router.routes())
   .use(router.allowedMethods());
app.listen('3006',(err)=>{
    if(err){
      console.log('服务器失败');
    }else{
      console.log('服务器启动成功:地址为:http://localhost:3006');
    }
})