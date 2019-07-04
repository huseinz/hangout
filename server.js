const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 8000;
const helmet = require('helmet');
const nunjucks = require('nunjucks');

app.use(cors());
app.use(helmet());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('frontend/static'));

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5000');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
	next();
});
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

nunjucks.configure('frontend/templates', {autoescape: true, express: app});
app.set('view engine', 'html');

app.use(require('./routes/main'));

//pre-flight requests
app.options('*', function(req, res) {
	res.send(200);
});

server.listen(port, (err) => {
	if (err) {
		throw err;
	}
	/* eslint-disable no-console */
	console.log('Node Endpoints working :)');
});


module.exports.server = server;
module.exports.io = io;

//somehow get sockets.js to be loaded
require('./routes/sockets');
