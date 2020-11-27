const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 5000;
const helmet = require('helmet');
const nunjucks = require('nunjucks');
const MongoClient = require('mongodb').MongoClient;


let db = undefined;
let userdb = undefined;
MongoClient.connect('mongodb://localhost:27017/hangout', (err, database) => {
	if (err) console.log(err);
	db = database.db();
	userdb = db.collection('users');
	db.collection('users').find({}).toArray((err, items) => {console.log(items)});
});

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
const httpserver = require('http').createServer(app);
const io = require('socket.io').listen(httpserver);

nunjucks.configure('frontend/templates', {autoescape: true, express: app});
app.set('view engine', 'html');

app.use(require('./routes/main'));

//pre-flight requests
app.options('*', function(req, res) {
	res.send(200);
});

httpserver.listen(port, (err) => {
	if (err) {
		throw err;
	}
	/* eslint-disable no-console */
	console.log('Node Endpoints working :)');
});


module.exports.app = app;
module.exports.httpserver = httpserver;
module.exports.io = io;
module.exports.db = db;
module.exports.userdb = userdb;

//somehow get sockets.js to be loaded
require('./routes/sockets');
require('./routes/shell');
