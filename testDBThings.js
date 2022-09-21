const fs = require("fs");

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;


//globals


MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;

  db = client.db('dungeonManager');
})