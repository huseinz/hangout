var express = require('express');
var router = express.Router();
var path = require('path');
var app_im = require('../app');

var nunjucks = require('nunjucks');

router.get('/', (err, res) => {
	res.status(200);
	res.render('hello.html');
});

router.post('/', (err, res) => {
	res.status(200);
	res.send('working');
	res.end();
});

router.put('/', (err, res) => {
	res.status(200);
	res.send('working');
	res.end();
});

module.exports = router;
