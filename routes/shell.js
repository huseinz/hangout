const io = require("../server").io;
const shellsocket = io.of('/shell');
const pty = require('pty.js');

// Instantiate shell and set up data handlers
shellsocket.on('connection',  (socket) => {
    // Spawn the shell
    const shell = pty.spawn('/bin/bash', [], {
        name: 'xterm-color',
        cwd: process.env.PWD,
        env: process.env
    });
    // For all shell data send it to the socket
    shell.on('data', (data) => {
        socket.emit('data', data);
    });
    // For all socket data send it to the shell
    socket.on('data', (msg) => {
        shell.write(msg);
    });
});