//开始服务启动计时器
console.time("[WebSvr][Start]");
//创建服务器
var app = require("http").createServer(require("getServer").getServer());
var io = require("socket.io").listen(app);
//监听80端口
app.listen(80, function() {
	//向控制台输出服务启动的信息
	console.log("[WebSvr][Start] running at http://localhost/");
	//结束服务启动计时器并输出
	console.timeEnd("[WebSvr][Start]");
});
//输出log信息
var showData = function(data, code) {
    var from = null;
    switch(code) {
        case 0 : from = "System";break;
        case 1 : from = "Server";break;
        case 2 : from = "Client";break;
    }
    console.log("["+new Date().toLocaleString()+"]["+from+"]"+data);
}
//创建socket服务
io.sockets.on("connect", function(socket) {
	showData(socket.id+" connect success!", 0)
	socket.on("disconnect", function() {
		showData(socket.id+" disconnect!", 0)
	});
	socket.send("test!");
});