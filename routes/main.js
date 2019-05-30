var express = require('express');
var router = express.Router();

router.get('/', (err, res) => {
	res.status(200);
	res.render('hello.html');
});

router.get('/hack-me', (err, res) =>{
	res.render('ws.html');
});

router.post('/', (err, res) => {
	res.status(200);
	res.send('working');
	res.end();
});

module.exports = router;
