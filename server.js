//get all required libs, set values
const pug = require('pug');
const mongoose = require("mongoose");
let mongo = require('mongodb');
const path = require("path");
let MongoClient = mongo.MongoClient;
mongoose.connect('mongodb://localhost/dungeonManager', {useNewUrlParser: true});
const ObjectId = require('mongodb').ObjectId;
let db = mongoose.connection;
let Users = db.collection("users");
const fs = require("fs");
const express = require('express')
const session = require('express-session');
const { render } = require("pug");
const e = require("express");
const app = express()
const multer = require("multer")
const bodyParser = require('body-parser')

app.listen(3000);
console.log("Server listening on port 3000");
app.set("view engine", "pug");

//naming for file, temporary
let tickingNameID = 0;

//define the store for mongo stored session data
const MongoDBStore = require('connect-mongodb-session')(session);
let store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
  });


//TEMP SOLUTION
const upload = multer({
  //dest: "C:\Users\Owner\Documents\GitHub\dungeon-manager\images"
  dest: "/Users/shibbler/Documents/GitHub/dungeon-manager/images"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


//define session and other values
app.use(session({ secret: 'some secret here',store: store}))
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//define gateways
app.get('/', serveHome);

app.post('/image',
  //credit https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
  upload.single("file"),(req, res) => {
    const tempPath = req.file.path;
    console.log(tempPath)
    const targetPath = path.join(__dirname, `./images/${tickingNameID}.png`);
    console.log(targetPath)
    tickingNameID++;

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err){
          console.log("something went wrong")
        }
        console.log("image received")
        uploadPictureToDB(tickingNameID);
        res.sendStatus(200)

      });
    }
    //issue with upload CURRENTLY NOT A PNG FILE
    else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res.status(403).contentType("text/plain").end("Only .png files are allowed!");
      });
    }
  });

//to read the HTML files
//app.get("/orderform.js", sendOrderJs);
//app.get("/userList.js", sendUserList);

function uploadPictureToDB(picName){
  console.log(picName)
}


function serveHome(req,res,next){
  res.render('acceptImage');
}

function receiveImage(req,res,next){
  console.log("image post")
  //credit https://stackoverflow.com/questions/15772394/how-to-upload-display-and-save-images-using-node-js-and-express
  upload.single("file"),(req, res) => {
    const tempPath = req.file.path;
    console.log(tempPath)
    const targetPath = path.join(__dirname, "./images/image.png");
    console.log(targetPath)

    if (path.extname(req.file.originalname).toLowerCase() === ".png") {
      fs.rename(tempPath, targetPath, err => {
        if (err){
          console.log("something went wrong")
        }
        console.log("image received")
        res.sendStatus(200)

      });
    }
    //issue with upload CURRENTLY NOT A PNG FILE
    else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res.status(403).contentType("text/plain").end("Only .png files are allowed!");
      });
    }
  }
  console.log("end step")
}

function serveImageUpload(req,res,next){

  fs.readFile("imageUpload.js", function(err, data){
		if(err){
			res.status(500).send("Error.");
			return;
		}
		res.status(200).send(data)
	});

}
