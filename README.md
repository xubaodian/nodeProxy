本例用node搭建的代理服务器。<br>
支持普通的请求和文件上传功能。<br>
主要代码在common/proxy.js中，代码不复杂。<br>

在server文件下下的app.js和app2.js是两个测试服务器。<br>


app2为目标服务器，有两个接口。<br>
一个是/upload，测试文件上传功能，上传文件将放在uploads文件夹下，上传的文件，文件名是一个uuid，没有后缀，添加后缀即可查看文件是完整。<br>
一个是/json，测试普通的请求。<br>


app.js为代理服务为器，监听端口为18000。
启动后，有两个测试页面：<br>
1、http://localhost:18000/json.html 测试普通请求，对用app2中的/json接口 <br>
2、http://localhost:18000/upload.html 文件上传测试，对应app2 中的/upload接口。<br>

