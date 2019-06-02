let express = require('express');
let router = express.Router();

router.get('/', (err, res) => {
    res.status(200);
    res.render('hello.html');
});

router.post('/', (err, res) => {
    res.status(200);
    res.send('working');
    res.end();
});

router.get('/login', (err, res) => {
    res.render('login.html');
});

router.post('/login', (err, res) => {
    //do something with login info
});

router.get('/hack-me', (err, res) =>{
    res.render('ws.html');
});

router.get('/ls', (err, res) => {
    const filetree = require('../core/ls').filetree;
    res.render('ls.html', { files: filetree(process.cwd())});
});

router.get('/pixelsorter', (err, res) => {
    res.render('pixelsorter.html');
});

module.exports = router;
