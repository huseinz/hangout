const express = require("express");
const router = express.Router();

const fs = require("fs");
const Jimp = require("jimp");

router.get("/", (err, res) => {
  res.status(200);
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

router.get("/ls_page", (err, res) => {
  const filetree = require("../core/ls").filetree;
  res.render("ls.html", { files: filetree(process.cwd()) });
});
router.get("/ls", (err, res) => {
  const filetree = require("../core/ls").filetree;
  res.json(filetree(process.cwd() + "/frontend/static/img"));
});

router.post("/upload", (req, res) => {
  let b64 = req.body.b64;
  b64 = b64.split(";base64,").pop();

  const tmpfn = "/tmp/" + req.body.name;
  const outfn = "./frontend/static/img/" + req.body.name;

  fs.writeFile(tmpfn, b64, { encoding: "base64" }, function(err) {
    console.log("File created");
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
