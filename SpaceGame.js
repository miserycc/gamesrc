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
var room = function(id) {
	this.player1 = null;
	this.player2 = null;
	this.status = 0;
	this.id = id;
}
var rooms = function() {
	var rooms = new Array([10]);
	for (var i = 0; i < 10; i++) {
		rooms[i] = new room(i+1);
	}
	return rooms;
}
//创建socket服务
var rs = new rooms();
io.sockets.on('connection', function (socket) {
	socket.emit('rooms',rs);
 	socket.on('join', function (data) {
 		if(socket.room == data) {
			return;
		}
	 	socket.join(data);			
	  	if(socket.room) {
	 		socket.leave(socket.room);			
 		}
 		socket.room = data;
	 	socket.attack = 0;
 		var id = parseInt(data) - 1;
 		var room = rs[id];
 		switch(room.status) {
 			case 0:
		 		room.player1 = socket.id.substring(0,5);
	 			room.status = 1;
	 			break;
 			case 1:
 				if(room.player1 == null) {
		 			room.player1 = socket.id.substring(0,5);
 				} else {
		 			room.player2 = socket.id.substring(0,5);
 				}
	 			room.status = 2;
	 			io.sockets.in(socket.room).emit('start');
	 			break;
 			case 2:
	 		 	socket.emit('err', "The room is full!");
	 			break;
 		}
 		console.log(socket.id+" join in "+data);
 		socket.broadcast.emit('rooms', rs);
 	});
 	socket.on('disconnect', function() {
 		if(socket.room == undefined)return;
 		socket.to(socket.room).broadcast.emit("leave");
 		var room = rs[socket.room - 1];
 		switch(room.status) {
 			case 2:
 				if(room.player1 == socket.id.substring(0,5)) {
 					room.player1 = null;
 				} else {
		 			room.player2 = null
 				}
	 			room.status = 1;
	 			break;
 			case 1:
 				if(room.player1 == socket.id.substring(0,5)) {
 					room.player1 = null;
 				} else {
		 			room.player2 = null
 				}
	 			room.status = 0;
	 			break;
 		}
 		socket.leave(socket.room);
 		socket.broadcast.emit('rooms', rs);
 		console.log(socket.id+" leave "+socket.room);
 	});
 	socket.on('attack', function() {
 		socket.to(socket.room).broadcast.emit("attack");
 		socket.attack++;
 		if(socket.attack == 100) {
 			socket.emit('win');
 			socket.to(socket.room).emit('lose');
 		}
 	});
 	socket.on('again', function() {
 		socket.to(socket.room).broadcast.emit("again");
 		socket.attack = 0;
 	});
 	socket.on('accept', function() {
 		io.sockets.in(socket.room).emit('start');
 		socket.attack = 0;
 	});
});
