//get all required libs, set values
const pug = require('pug');
const mongoose = require("mongoose");
let mongo = require('mongodb');
const path = require("path");
let MongoClient = mongo.MongoClient;
mongoose.connect('mongodb://localhost/dungeonManager', {useNewUrlParser: true});
const ObjectId = require('mongodb').ObjectId;
let db = mongoose.connection;
//let Users = db.collection("users");
const fs = require("fs");
const express = require('express')
const session = require('express-session');
const { render } = require("pug");
const e = require("express");
const app = express()
const multer = require("multer")
const bodyParser = require('body-parser')

//using two view engines
app.set('view engine', 'pug');
app.set('view engine', 'ejs');

//naming for file, temporary
let tickingNameID = 0;

//define schema for images
var imgModel = require('./schemas/imageModel');


//define the store for mongo stored session data
const MongoDBStore = require('connect-mongodb-session')(session);
let store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
    collection: 'mySessions'
  });


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
  }
});

var upload = multer({ storage: storage });

//define session and other values
app.use(session({ secret: 'some secret here',store: store}))
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//define gateways
app.get('/', serveHome);
app.get('/images',serveImagesPage)
app.get('/monsters', findMonsters)
app.post('/images',upload.single('image'),uploadPictureToDB)


//to read the HTML files
//app.get("/orderform.js", sendOrderJs);
//app.get("/userList.js", sendUserList);

function uploadPictureToDB(req,res,next){
  console.log("picture upload")
  //create the image to upload
  fileName = path.join(__dirname + '/uploads/' + req.file.filename)
  var obj = {
    name: req.body.name,
    desc: req.body.desc,
    img: {
        data: fs.readFileSync(fileName),
        contentType: 'image/png'
    }
  }
  //upload the image to mongoose by using the schema.create feature
  imgModel.create(obj, (err, item) => {
    if (err) {
        console.log(err);
    }
    else {
        //delete the file so it only stored on mongo
        fs.unlinkSync(fileName)
        res.redirect('/images');
    }
  })
}


function serveHome(req,res,next){
  res.render('home.pug');
}

function findMonsters(req,res,next){
  //looking for one specific monster

  //should change this to build a massive query. Will update later.
  if (req.body.id){
    console.log('I should only find one monster')
  }
  //find all monsters
  else{
    db.collection('monsters').find().toArray(function(err,result){
      if (err || result == null){
        console.log('Something went wrong')
      }
      else{
        res.render("monsterView.pug",{monsters:result})
      }
    })
  }
}


function serveImagesPage(req,res,next){
  console.log("here")
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            console.log("here!")
            res.render('imagesPage.ejs', { items: items });
        }
    })
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


app.listen(3000);
console.log("Server listening on port 3000");