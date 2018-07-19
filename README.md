### node + express 搭建代理服务器（附源码）

本文用node + express搭建代理一个服务器，现在一步一步讲解如何搭建。<br>
在正式讲解之前，聊下为什么要搭建代理服务器。代理服务器可以实现功能，主要应用如下。<br>
1.前端独立部署，现在前后端开发分离，部署分离是大趋势，自然需要一个静态资源服务器，当然，也可以直接将打包文件放在tomcat或apache下，但是如果需要一些服务端渲染或者其他功能，就需要搭建一台代理服务器了。原理图如下：
<img src="./docs/代理服务器1.jpg" width="550" height="350" /><br>
请求先发到node代理服务器上，对于静态资源，node进行管理，其他业务请求，去调用后端服务器的接口，再讲数据返回。<br>
2.现在大部分应用都是分布式架构的，或者是微服务架构的，二者还是有很大区别的，这个时候需要一个服务器做消息调度。原理图如下：
<img src="./docs/分布式环境.jpg" width="750" height="550" /><br>
这个图和大家解释一下，这是一个非常简单的分布式架构图，首先管理中心，管理中心可以是独立的，本身也可以是分布式的。它负责管理所有服务地址，状态等信息，要进行业务处理，首先就需要向它查询目标服务器地址。下面有客户服务、计费服务、广告服务等多个应用服务，这些都是根据公司业务划分的各个独立服务。一个请求的完整路径如下：<br>
1、浏览器向node代理服务器发出请求，需要修改客户信息。<br>
2、node代理服务器向管理中心发出请求，查询客户服务目标服务器的地址信息。<br>
3、管理中心查询后给出相应地址。<br>
4、node代理服务器向客户服务请求，修改客户信息。<br>
5、客户服务返回修改结果。<br>
6、node代理服务器向浏览器或客户端返回修改信息<br>

当然还有其他用处，比如负载均衡等等，不做过多介绍，向了解的小伙伴可以多找些材料学习一下。<br>

本文要实现的功能是，代理服务器可以进行静态资源管理和请求代理转发。
搭建需要大家具备如下知识：
- javaScript知识
- node.js知识
- express知识
- 对服务端和http协议有了解
#### 环境准备
在编写代码前，需要先把环境安装好，新建一个express（给予node的框架，简单易学，很容易上手）工程，这是前置条件<br>
1.安装node,npm，这个应该不需要讲了.<br>
2.新建一个项目， command: npm init.<br>
3.安装express依赖，npm install express -D.<br>
到目前为止，一个express项目就创建完毕，现在就进行编码。

#### 编码
介绍一下工程的目录结构，包括common、config、docs、router、server、static几个文件夹。
<img src="./docs/工程结构.jpg" width="200"/>
server有两个js文件，app.js是代理服务器，app2.js是目标服务器，有两个接口，登陆和退出。router是代理服务器的路由。config下放置的是代理服务器的配置文件，项目的参数可以在此配置。common下两个文件，configReader读取配置文件信息，并将其转化为一个Object,proxy是代理的函数。static是静态资源，向node代理服务器发送登录和退出请求。<br>
代码没什么难度，下面贴出来，不进行详细介绍了。
1、代理函数如下
``` javascript
const http = require('http');
const querystring = require('querystring');

let getHeader = (reqClient) => {
    let headers = reqClient.headers; 
    headers.path = reqClient.path;
    headers.query = reqClient.query;
    headers.cookie = reqClient.get('cookie') || '';

    return headers;
}

let proxy = (options) => {
    let reqOptions = {
        hostname: options.host,
        port: options.port
    }
    
    return function (reqClient, resClient) {
        console.log(reqClient.query);
        let headers = getHeader(reqClient);
        reqOptions.headers = reqClient.headers;
        let query = [];
        if (headers.query) {
            Object.keys(headers.query).map(key => {
                query.push(key + '=' + headers.query[key]);
            });
            reqOptions.path = headers.path + (query.length === 0 ? '' : ('?' + query.join('&')));
            
        }
        reqOptions.cookie = headers.cookie;
        reqOptions.method = reqClient.method;

        let reqProxy = http.request(reqOptions, (resProxy) => {
            if (resProxy.statusCode === 200) {
                console.log(`响应头: ${JSON.stringify(resProxy.headers)}`);
                resProxy.setEncoding('utf8');
                let data = '';
                resProxy.on('data', (chunk) => {
                    data += chunk;
                    console.log(`响应主体: ${chunk}`);
                });
                //接收目标服务器数据，再次对数据和返回头进行处理，然后返回请求
                resProxy.on('end', () => {
                    resClient.set(resProxy.headers);
                    resClient.send(JSON.parse(data));
                });
            } else {
                resClient.status(400).send('Bad Request');
            }
        });
        reqProxy.on('error', (err) => {
            resClient.status(400).send('Bad Request');
            console.error(`a request error occurred: ${err.message}`);
        });
    
        reqProxy.write(querystring.stringify(reqClient.body));
        reqProxy.end();
        
    }
}

module.exports = proxy;
```
proxy是一个闭包，返回一个处理转发请求的函数。
读取配置文件的函数如下：
```javascript
/**
 * created br xubaodian  2018/7/18 15:00
 * decription: read the file of config and parse the content to an Object
 */

const fs = require('fs');

//set the Object property, obj is target Object, prop is the property
//prop support the format like xxx.xxx.xxx... 
let setProperty = (obj, prop, value) =>{
    let propArr = prop.split('.');
    let len = propArr.length;
    let tmpObj = obj;
    for (let i = 0; i < len; i++) {
        if (i === len -1) {
            tmpObj[propArr[i]] = value;
        } else if (!tmpObj[propArr[i]]) {
            tmpObj[propArr[i]] = {};
        }
        tmpObj = tmpObj[propArr[i]];
    }
}

//return a promise, and the paramete of then function is config Object
let configReader = (url) => {
    return new Promise((resolve, reject) => {
        fs.readFile(url, (err, data)=>{
            if (err) {
                console.error('error to read the config file,the error Code is：' + err.code);
                reject(err);
            }
            let configStr =  data.toString();
            let configArr = configStr.split(/\r\n/);
            let configJson = {};
            configArr.map(item => {
                let arr = item.replace(/^\s*||\s*$/, '').split(/\s*=\s*/);
                setProperty(configJson, arr[0], arr[1]);
            });
            resolve(configJson);
        });
    });
}

module.exports = configReader;
```
代理服务器路由：
``` javascript
let express = require('express');
let router = express.Router();
let proxy = require('../common/proxy');
let options = {
    host: '127.0.0.1',
    port: 20000
}

router.all(/^\//, proxy(options));

module.exports = router;
```
代理服务器代码如下：
``` javascript
const express = require('express');
const app = express();
const configReader = require('../common/configReader');
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

//代理服务器
let config = configReader(path.join(__dirname, '../config/run-config'));
app.use(express.static(path.join(__dirname, '../static')));
app.use('/', require('../router/login'));

config.then(configJson => {
    let port = parseInt(configJson.server.port);
    let server = app.listen(port, () =>{
        console.log(`started the server,the port is ${port}`);
    });
});
```
目标服务器代码：
```javascript
const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/login', (req, res) => {
    console.log(req.query);
    console.log(req.body);
    res.set('Set-Cookie', 'sessionId: thisisvip');
    res.send({
        status: 'logon'
    })
});

app.put('/logout', (req, res) => {
    console.log(req.query);
    console.log(req.body);
    res.set({
        'Set-Cookie': 'sessionId: thisisvip;max-age=0'
    });
    res.send({
        status: 'logout'
    })
});

let server = app.listen(20000, () =>{
    console.log(`started the server,the port is 20000`);
});
```

