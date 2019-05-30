const io = require('../server').io;

io.on('connection', function (socket) {
	console.log('client connected');
	socket.emit('test', 'hi!!');
	socket.on('test', function (data) {
		console.log(data);
	});
});

