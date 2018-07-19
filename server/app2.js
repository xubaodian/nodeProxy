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