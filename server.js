//get all required libs, set values
const pug = require('pug');
const mongoose = require("mongoose");
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
//mongoose.connect('mongodb://localhost/a4', {useNewUrlParser: true});
const ObjectID = require('mongodb').ObjectID;
let db = mongoose.connection;
let Users = db.collection("users");
const fs = require("fs");
const express = require('express')
const session = require('express-session');
const { render } = require("pug");
const e = require("express");
const app = express()

let monsters = [];

let monsterToAdd = [];


app.listen(3000);
console.log("Server listening on port 3000");
app.set("view engine", "pug");


readMonsterData();

/*
//define the store for mongo stored session data
const MongoDBStore = require('connect-mongodb-session')(session);
let store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
  });
*/

//define session and other values
//app.use(session({ secret: 'some secret here',store: store}))
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//define gateways
app.get('/', serveHome);

//to read the HTML files
//app.get("/orderform.js", sendOrderJs);
//app.get("/userList.js", sendUserList);

function serveHome(req,res,next){

}

function readMonsterData(){//read all data from the product file.
    //may not need to say .json here
    fs.readFile("monsters.json", 'utf-8', function(err, content) {
            if (err) {
              console.log(`ERROR ON ACCESS`);
              return;
            }
            else{//if all goes smoothly
              monsterToAdd = JSON.parse(content);//load the file content as a JSON file
              // console.log(products)
              //console.log(products);
              //console.log(monsterToAdd)
              monsterToAdd.forEach(product=>{
                monsters.push(product);
              })
              console.log(monsters.length)
              console.log(monsters[0])
              
            }
      });
  }