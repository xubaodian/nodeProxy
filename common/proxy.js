const http = require('http');
const querystring = require('querystring');

//获取请求的cookie和query等
let getHeader = (reqClient) => {
    let headers = reqClient.headers; 
    headers.path = reqClient.path;
    headers.query = reqClient.query;
    headers.cookie = reqClient.get('cookie') || '';

    return headers;
}

//代理函数，options是代理设置，包括目标服务器ip，port等
let proxy = (options) => {
    let reqOptions = {
        hostname: options.host,
        port: options.port
    }
    //返回请求处理函数，reqClient浏览器的请求，resClient是响应浏览器的对象
    return function (reqClient, resClient) {
        //设置目标服务器的请求参数，头中的各项参数
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
        //向目标服务器发送请求,reqProxy是向目标服务器的请求，resProxy是目标服务器的响应。
        let reqProxy = http.request(reqOptions, (resProxy) => {
            resProxy.setEncoding('utf8');
            //设置返回http头
            resClient.set(resProxy.headers);
            resClient.status(resProxy.statusCode);
            //接收从目标服务器返回的数据
            resProxy.on('data', (chunk) => {
                //接收目标服务器数据后，以流的方式向浏览器返回数据
                resClient.write(chunk);
            });

            //接收目标服务器数据结束
            resProxy.on('end', () => {
                //向浏览器写数据结束。
                resClient.end();
            });
            //目标服务器响应错误
            resProxy.on('error', () => {
                //响应错误，结束向浏览器返回数据
                resClient.end();
            });
        });

        //接收浏览器数据
        reqClient.on('data', (chunk) => {
           //以流的方式向目标服务器发送数据
            reqProxy.write(chunk);
        });
        //接收数据结束
        reqClient.on('end', () => {
          //向目标服务器写数据结束
            reqProxy.end();
        });
        
        //普通JSON数据代理
         if (Object.keys(reqClient.body).length) {
             reqProxy.write(querystring.stringify(reqClient.body));
             reqProxy.end();
         }
    }
}

module.exports = proxy;