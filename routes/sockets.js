const io = require("../server").io;
const chatsocket = io.of('/chat');

let tmpmessages = [{username:'zubir', message:"doinks"}];

chatsocket.on("connection", function(socket) {
  console.log("chat client connected");
  socket.on("userpost", function(data) {
    console.log("got message:", data);
    tmpmessages.push(data);
    socket.emit("postfeed", JSON.stringify(tmpmessages));
  });
  socket.emit("postfeed", JSON.stringify(tmpmessages));
});