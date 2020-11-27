const io = require("../server").io;
const chatsocket = io.of('/chat');
const uuidv1 = require('uuid/v1');
const db_client = require('../core/db');

let tmpmessages = [{username:'zubir', message:"doinks", uuid:uuidv1()}];

const db_write_global_chat = async (post) => {
  try {
    const client = await db_client();
    const db = client.db("hangout");
    const collection = db.collection("chat-global");
    const result = await collection.insertOne(post);
    console.log(
        `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );
  } catch (e) {
    console.log(e);
  }
};

const db_get_global_chat = async () => {
  try {
    const client = await db_client();
    const db = client.db("hangout");
    const collection = db.collection("chat-global");
    return await collection.find().sort({timestamp: 1}).toArray();

  } catch (e) {
    console.log(e);
  }
};

const db_update_and_refresh_global_chat = async (post) => {
  await db_write_global_chat(post);
  return await db_get_global_chat();
};

chatsocket.on("connection", function(socket) {
  console.log("chat client connected");
  socket.on("userpost", function(data) {
    console.log("got message:", data);
    db_update_and_refresh_global_chat(data).then((posts) => {
      console.log(posts);
      socket.broadcast.emit("postfeed", JSON.stringify(posts));
      socket.emit("postfeed", JSON.stringify(posts));
    }).catch((e) => {console.log(e)});
  });
  db_get_global_chat().then((posts) => {console.log(posts); socket.emit("postfeed", JSON.stringify(posts));}).catch((e) => {console.log(e)});
});
