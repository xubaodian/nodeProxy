let express = require('express');
let router = express.Router();
let proxy = require('../common/proxy');
//目标服务器地址
let options = {
    host: '127.0.0.1',
    port: 20000
}

router.all(/^\//, proxy(options));

module.exports = router;