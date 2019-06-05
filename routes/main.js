let express = require('express');
let router = express.Router();

const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

let Base64 = require('js-base64').Base64;
let fs = require('fs');
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
router.get('/util', (err, res) =>{
    res.render('util.html');
});

router.get('/ls_page', (err, res) => {
    const filetree = require('../core/ls').filetree;
    res.render('ls.html', { files: filetree(process.cwd())});
});
router.get('/ls', (err, res) => {
    const filetree = require('../core/ls').filetree;
    res.json(filetree(process.cwd()+"/frontend/static/img"));
});

router.post('/upload', jsonParser, (req, res) => {
    let b64 = req.body.b64;
    //JS image, not my Image!!
    let img = new Image();
    img.src = b64;
    img.save
    fs.writeFile("img.png", Base64.atob(b64),"binary", ()=>{res.sendStatus(200)});
});

router.get('/pixelsorter', (err, res) => {
    res.render('pixelsorter.html');
});

module.exports = router;
