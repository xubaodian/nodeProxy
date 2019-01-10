本例用node搭建的代理服务器。<br>
支持普通的请求和文件上传功能。<br>
主要代码在common/proxy.js中，代码不复杂。<br>

在server文件下下的app.js和app2.js是两个测试服务器。<br>


app2为目标服务器，有3个接口。<br>
1、'/upload'接口，测试文件上传功能，上传文件将放在uploads文件夹下，上传的文件，文件名是一个uuid，没有后缀，添加后缀即可查看文件是完整。测试过，传1G的文件没问题，再大的文件没试过，有需要的可以试下<br>
2、'/json'，测试POST请求。<br>
3、'/get'，测试GET请求。<br>
有两个测试页面<br>
1、http://localhost:18000/json.html post请求测试，对应'/json'接口 <br>
2、http://localhost:18000/upload.html 文件上传测试，对应接口'/upload'接口。<br>
3、http://localhost:18000/get.html get请求测试，对应接口'/get'<br>


app.js为代理服务为器，监听端口为18000,将所有请求转发至app2，即所有app2的接口静态资源，app中访问时一致的。



至于性能，我没测过，因为我自己这边的应用场景，访问量都不大，可以使用。

