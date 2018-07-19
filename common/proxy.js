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