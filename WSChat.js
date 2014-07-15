//开始服务启动计时器
console.time('[WebSvr][Start]');
//创建服务器
var app = require('http').createServer(require('getServer').getServer());
var io = require('socket.io').listen(app);
//监听80端口
app.listen(80, function() {
	//向控制台输出服务启动的信息
	console.log('[WebSvr][Start] running at http://127.0.0.1/');
	//结束服务启动计时器并输出
	console.timeEnd('[WebSvr][Start]');
});
//创建socket服务
io.sockets.on('connection', function (socket) {
	socket.on('message', function (data) {
		if(socket.room) {		
		 	socket.to(socket.room).broadcast.emit('chat', { "data" : data.message , "username" : socket.username});
		} else {
			socket.emit('chat', {"data" : "You are not in room" , "username" : "system"});
		}
	 	console.log("["+socket.room +"]"+socket.username+":"+ data.message);
 	});
 	socket.on('join', function (data) {
 		if(socket.room != data.room) {
	 		socket.join(data.room);			
	  		if(socket.room) {
		 		socket.leave(socket.room);			
	 		}
		}
 		socket.room = data.room;
 		socket.username = data.username;
 	});
});
