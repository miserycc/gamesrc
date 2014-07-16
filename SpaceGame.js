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
	this.p1name = null;
	this.p2name = null;
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
	 		if(socket.room == undefined)return;
	 		socket.to(socket.room).broadcast.emit("break");
	 		var room = rs[socket.room - 1];
	 		if((room == undefined)||(room.status == undefined))return;
	 		switch(room.status) {
	 			case 2:
	 				if(room.player1 == socket.id) {
	 					room.player1 = null;
	 					room.p1name = null;
	 				} else {
			 			room.player2 = null;
			 			room.p2name = null;
	 				}
		 			room.status = 1;
		 			break;
	 			case 1:
	 				if(room.player1 == socket.id) {
	 					room.player1 = null;
	 					room.p1name = null;
	 				} else {
			 			room.player2 = null;
			 			room.p2name = null;
	 				}
		 			room.status = 0;
		 			break;
	 		}	  		
	 		socket.leave(socket.room);			
	 		socket.broadcast.emit('rooms', rs);
	 		console.log(socket.nickName+" leave "+socket.room);
	 		io.sockets.emit('chat', {"message":socket.nickName+" leave "+socket.room ,"nickName": "", "room": "System"});
 		}
 		socket.room = data;
	 	socket.attack = 0;
 		var id = parseInt(data) - 1;
 		var room = rs[id];
 		switch(room.status) {
 			case 0:
		 		room.player1 = socket.id;
		 		room.p1name = socket.nickName;
	 			room.status = 1;
	 			break;
 			case 1:
 				if(room.player1 == null) {
		 			room.player1 = socket.id;
		 			room.p1name = socket.nickName;
 				} else {
		 			room.player2 = socket.id;
		 			room.p2name = socket.nickName;
 				}
	 			room.status = 2;
	 			io.sockets.in(socket.room).emit('start');
	 			break;
 			case 2:
	 		 	socket.emit('err', "The room is full!");
	 			break;
 		}
 		console.log(socket.nickName+" join in "+data);
 		io.sockets.emit('chat', {"message":socket.nickName+" join in "+socket.room ,"nickName": "", "room": "System"});
 		socket.broadcast.emit('rooms', rs);
 	});
 	socket.on('disconnect', function() {
 		if(socket.room == undefined)return;
 		socket.to(socket.room).broadcast.emit("break");
 		var room = rs[socket.room - 1];
 		if((room == undefined)||(room.status == undefined))return;
 		switch(room.status) {
 			case 2:
 				if(room.player1 == socket.id) {
 					room.player1 = null;
 					room.p1name = null;
 				} else {
		 			room.player2 = null;
		 			room.p2name = null;
 				}
	 			room.status = 1;
	 			break;
 			case 1:
 				if(room.player1 == socket.id) {
 					room.player1 = null;
 					room.p1name = null;
 				} else {
		 			room.player2 = null;
		 			room.p2name = null;
 				}
	 			room.status = 0;
	 			break;
 		}
 		socket.leave(socket.room);
 		socket.broadcast.emit('rooms', rs);
 		console.log(socket.nickName+" leave "+socket.room);
 		io.sockets.emit('chat', {"message":socket.nickName+" leave "+socket.room ,"nickName": "", "room": "System"});
 		socket.room = null;
 		socket.attack = 0;
 	});
 	socket.on('attack', function() {
 		socket.to(socket.room).broadcast.emit("attack");
 		socket.attack++;
 		if(socket.attack == 100) {
 			socket.emit('win');
 			io.sockets.emit('chat', {"message":socket.nickName+" win!" ,"nickName": "", "room": "System"});
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
 	socket.on('nickName',function(data) {
 		if(data == "") {
 			data = "SpacerX";
 		}
 		socket.nickName = data;
 	});
 	socket.on('chat',function(data) {
 		if(socket.nickName == undefined) {
 			socket.nickName = "SpacerX";
 		}
 		if(socket.room == undefined) {
 			socket.room = "World";
 		}
 		io.sockets.emit('chat', {"message":data ,"nickName": socket.nickName, "room": "Room "+socket.room});
 	});
 	socket.on('leave',function() {
 		socket.emit('leave');
 		var sks = io.sockets.to(socket.room).sockets;
 		for(var i = 0; i < sks.length; i++) {
 			sks[i].attack = 0;
 		}
 		io.sockets.in(socket.room).emit('break');
 		if(socket.room == undefined)return;
 		var room = rs[socket.room - 1];
 		if(room.status == undefined)return;
 		switch(room.status) {
 			case 2:
 				if(room.player1 == socket.id) {
 					room.player1 = null;
 					room.p1name = null;
 				} else {
		 			room.player2 = null;
		 			room.p2name = null;
 				}
	 			room.status = 1;
	 			break;
 			case 1:
 				if(room.player1 == socket.id) {
 					room.player1 = null;
 					room.p1name = null;
 				} else {
		 			room.player2 = null;
		 			room.p2name = null;
 				}
	 			room.status = 0;
	 			break;
 		}
 		socket.leave(socket.room);
 		console.log(socket.nickName+" leave "+socket.room);
 		io.sockets.emit('chat', {"message":socket.nickName+" leave "+socket.room ,"nickName": "", "room": "System"});
 		io.sockets.emit('rooms', rs);
 		socket.room = null;
 	})
});
