const MongoClient = require("mongodb").MongoClient;

const url = "mongodb://localhost:27017/hangout";

var client;

const getClient = async () => {
    if (client && client.isConnected()) {
        console.log("DB CLIENT ALREADY CONNECTED");
    } else
        try {
            client = await MongoClient.connect(url, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log("DB CLIENT RECONNECTED");
        } catch (e) {
            throw e;
        }

    return client;
};

module.exports = getClient;