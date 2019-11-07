const express = require("express");
const router = express.Router();

const fs = require("fs");
const Jimp = require("jimp");

router.get("/", (err, res) => {
  res.status(200);
	console.log('wtf');
  res.render("hello.html");
});

router.post("/", (err, res) => {
  res.status(200);
  res.send("working");
  res.end();
});

router.get("/login", (err, res) => {
  res.render("login.html");
});

router.post("/login", (err, res) => {
  //do something with login info
});

router.get("/hack-me", (err, res) => {
  res.render("ws.html");
});
router.get("/util", (err, res) => {
  res.render("util.html");
});

router.get("/mr.robot", (err, res) => {
	console.log('wtf');
  const filetree = require("../core/ls").filetree;
  res.render("ls.html", { files: filetree('/var/www/html/mr.robot') });
});
router.get("/ls/:dir", (req, res) => {
  const filetree = require("../core/ls").filetree;
//  let cwd = process.cwd() + "/frontend/static/img";
  let cwd = "/var/www/html/".concat(req.params['dir']);
  res.json(filetree(cwd, cwd));
});

router.post("/pixelsorter/upload", (req, res) => {
  let b64 = req.body.b64;
  b64 = b64.split(";base64,").pop();

  const tmpfn = "/tmp/" + req.body.filename;
  const outfn = "./frontend/static/" + req.body.dir + '/' + req.body.filename ;

  fs.writeFile(tmpfn, b64, { encoding: "base64" }, function(err) {
    console.log("File created");
    console.log(tmpfn, outfn);
    console.log(err);
  });
  Jimp.read(tmpfn)
    .then(lenna => {
      return lenna
        .scaleToFit(800, 600) // resize
        .quality(99) // set JPEG quality
        .write(outfn); // save
    })
    .catch(err => {
      console.error(err);
    });

  fs.unlink(tmpfn, err => {
    if (err) console.log(err);
  });
  res.sendStatus(200);
});

router.get("/pixelsorter", (err, res) => {
  res.render("pixelsorter.html");
});

module.exports = router;
