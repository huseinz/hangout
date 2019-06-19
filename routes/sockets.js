const io = require("../server").io;
const chatsocket = io.of('/chat');
const uuidv1 = require('uuid/v1');


let tmpmessages = [{username:'zubir', message:"doinks", uuid:uuidv1()}];

chatsocket.on("connection", function(socket) {
  console.log("chat client connected");
  socket.on("userpost", function(data) {
    data.uuid = uuidv1();
    console.log("got message:", data);
    tmpmessages.push(data);
    socket.emit("postfeed", JSON.stringify(tmpmessages));
  });
  socket.emit("postfeed", JSON.stringify(tmpmessages));
});