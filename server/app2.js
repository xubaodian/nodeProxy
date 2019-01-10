const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

//使用multer插件接收文件
var multer  = require('multer')
//文件存放位置为uploads文件夹下
var upload = multer({ dest: '../uploads/' })

//代理服务器
app.use(express.static(path.join(__dirname, '../static')));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//测试文件上传接口
app.post('/upload', upload.single('file'), function (req, res, next) {
    console.log(req.header);
    res.setHeader('Set-Cookie', 'id=12341');
    res.send({
        resultCode: 1000,
        message: 'successs'
    });
  })

app.post('/json', (req, res) => {
    console.log(req.body);
    console.log(req.header);
    res.setHeader('Set-Cookie', 'id=12341');
    res.send({
        resultCode: 1000,
        message: 'successs'
    })
});

app.get('/get', (req, res) => {
    console.log(req.url);
    console.log(req.header);
    res.setHeader('Set-Cookie', 'id=12341');
    res.send({
        resultCode: 1000,
        message: 'successs'
    })
});

let server = app.listen(20000, () =>{
    console.log(`started the server,the port is 20000`);
});