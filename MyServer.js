var server = require('getServer').getServer();
var app = require('http').createServer(server).listen(80,function(){
	console.log("the server is running");
});
var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
	socket.on('message', function (data) {
		if(socket.room) {		
		 	socket.to(socket.room).broadcast.emit('chat', { "data" : data.message , "username" : socket.username});
		} else {
			socket.emit('chat', {"data" : "You are not in room" , "username" : "system"});
		}
	 	console.log("["+socket.room +"]"+socket.username+":"+ data.message);
	 	console.log(data);
 	});
 	socket.on('join', function (data) {
 		if(socket.room != data.room) {
	 		socket.join(data.room);			
	  		if(socket.room) {
		 		socket.leave(socket.room);			
	 		}
		}
		console.log(socket);
 		socket.room = data.room;
 		socket.username = data.username;
 		console.log(socket);
 	});
});

console.log("hello world");
