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
