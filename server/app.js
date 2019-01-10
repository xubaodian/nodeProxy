const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/', require('../router/router'));

let server = app.listen(18000, () =>{
    console.log(`started the server,the port is 18000`);
});
