let express = require('express');
let router = express.Router();
let proxy = require('../common/proxy');
let options = {
    host: '127.0.0.1',
    port: 20000
}

router.all(/^\//, proxy(options));

module.exports = router;