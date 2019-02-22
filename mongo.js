const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://kay:myRealPassword@cluster0.mongodb.net/admin";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
 // perform actions on the collection object
  client.close();
});