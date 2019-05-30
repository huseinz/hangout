var chat = io.connect('http://localhost:5000', {reconnect: true});

chat.on('test', function (d) {
    console.log(d);
});
chat.on('connect', function (data) {
    console.log('connect');
    chat.emit('test', 'fuck', function(){console.log('callback')});
});