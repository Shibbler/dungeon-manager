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

//naming for file, temporary
let tickingNameID = 0;

//define schema for images
var imgModel = require('./schemas/imageModel');
const { query } = require('express');
const { assert } = require('console');

let testDungeon = {name: 'test', _id: 'TEST ID'}


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

let Monsters = db.collection('monsters');
let Rooms = db. collection('rooms');
let Users = db.collection('users')
let Dungeons = db.collection('dungeons');
let Images = db.collection('image');

//define session and other values
app.use(session({ secret: 'some secret here',store: store}))
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//define gateways
app.get('/', serveHome);
app.get('/map',serveMap)
app.get('/main', serveMainViewer)
app.get('/monsters', findMonsters)
app.get('/monsters/:monsterID',serveSpecificMonster)
app.get('/rooms',sendRooms)
app.get('/room',sendSpecificRoom)
app.get('/dungeons',sendDungeons)

app.post('/room/monster',changeMonsterRoom)
app.get('/dungeons/:dungeonID',sendSpecificDungeon)
app.post('/dungeons',makeNewDungeon)
app.post('/deleteRoom',deleteRoom)

//gets for files
app.get("/style.css",sendCSS)
app.get("/dungeonViewer.js",serveDungeonViewer)
app.get("/dungeonSelect.js",serveDungeonSelect)

//users stuff
app.get('/register',serveRegisterPage)
app.post('/register',register);
app.get("/login",serveLoginPage)
app.post("/login",login)
app.get("/logout",logout)
app.get("/create",serveCreationPage)
app.post("/create",insertCreation)

app.post('/map',upload.single('image'),uploadPictureToDB)
app.post('/roomSave',saveRoomData)


function serveSpecificMonster(req,res,next){
  //console.log(req.params.monsterID)
  Monsters.findOne({"_id":ObjectId(req.params.monsterID)},function(err,result){
    if (result === null || err) console.log("monster not found")
    else res.render('specificMonster.pug',{monster:result})
  })

}


function deleteRoom(req,res,next){
  //delete the room from the dungeon
  Dungeons.updateOne({"_id": ObjectId(req.body.dungeon)},{$pull: {'rooms':ObjectId(req.body.roomID)}},function (err,result){
    if (err) console.log(err)
    //delete image associated with room
    imgModel.deleteOne({dungeon: req.body.dungeon,room: req.body.roomName},function(err,result){
      if (err) console.log(err)
      //delete the actual room
      Rooms.deleteOne({"_id":ObjectId(req.body.roomID)},function(err,result){
        if (err) console.log(err)
        res.status(200).send();
      })
    })
  })
}


function changeMonsterRoom(req,res,next){
  console.log(`adding monster: ${req.body.monster}`)
  Rooms.updateOne({"_id": ObjectId(req.body.roomID)}, {$push:{"monsters": req.body.monster}}, function(err,result){
    if (err) console.log(err)
    else{
      res.status(200).send();
    }
  })

}


function serveCreationPage(req,res,next){
  res.render('create.pug',{errorName: false, errorNaN: false})
}

function insertCreation(req,res,next){
  //ensure numbers
  if (isNaN(req.body.hp) || isNaN(req.body.cr) || isNaN(req.body.ac)){
    res.render('create.pug',{errorName: false, errorNaN: true})
    return;
  }
  Monsters.findOne({name: {$regex : req.body.name, $options: 'i'}},function(err,result){
    //if the monster already exists
    if (result != null){
      res.render('create.pug',{errorName: true, errorNaN: false} )
    }
    else{
      let monsterToInsert = {
        name: req.body.name,
        armor_class: req.body.ac,
        size: req.body.size,
        type: req.body.type,
        subtype: req.body.subtype,
        hit_points: req.body.hp,
        alignment: req.body.alignment,
        damage_vulnerabilities: req.body.damage_vulnerabilities,
        damage_resistances: req.body.damage_resistances,
        damage_immunities: req.body.damage_immunities,
        condition_immunities: req.body.condition_immunities,
        languages: req.body.languages,
        challenge_rating: req.body.cr
      }
      Monsters.insertOne(monsterToInsert,function(err,result){
        res.redirect('/')
      })
    }
  })

  //res.redirect('/')
}



function serveMap(req,res,next){
  //console.log("serving images page"

  console.log(req.query)
  let roomName = req.query.roomName;
  let dungeon = req.query.dungeon;
  console.log(roomName)
  console.log(dungeon)
  imgModel.findOne({room: roomName, dungeon: dungeon }, (err, item) => {
    if (err) {
      console.log(err);
      res.status(500).send('An error occurred', err);
      }
      else if (item == null || item.img == null){
        //console.log(item)
        console.log("got nothing for map search")
        res.status(200).send("No Map for this Room")
      }
      else {
        console.log("found map!")
        //console.log(item)
        //console.log(item.img)
        res.render("imagePortion.pug",{map:item})
      }
  })
}


function uploadPictureToDB(req,res,next){
  console.log("picture upload")
  //create the image to upload
  fileName = path.join(__dirname + '/uploads/' + req.file.filename)
  console.log(req.body.roomName)
  console.log(req.body.dungeon)
  var obj = {
    //add room data
    room: req.body.roomName,
    dungeon: req.body.dungeon,
    img: {
        data: fs.readFileSync(fileName),
        contentType: 'image/png'
    }
  }
  console.log(obj.room, obj.dungeon,obj.img.contentType)
  //delete the old room if it exists
  imgModel.findOne({room: req.body.roomName, dungeon:req.body.dungeon}).remove(function(err,item){
    if (err){
      console.log(err)
    }else{
      console.log("old file removed")
    }
  });
  //upload the image to mongoose by using the schema.create feature
  imgModel.create(obj, (err, item) => {
    if (err) {
        console.log(err);
    }
    else {
        //delete the file so it only stored on mongo
        fs.unlinkSync(fileName)
        //send something to code
        //temp sol'n rn
        //console.log(item.img.contentType)
        console.log('upload successful')
        res.render("imagePortion.pug",{map:item})
        //res.status(200).send(item)
    }
  })
}



function makeNewDungeon(req,res,next){
  let user = req.session.username;
  console.log(req.body.dungeonName)
  console.log(user);
  dungeonToInsert ={
    name: req.body.dungeonName,
    user: user,
    rooms: []
  }
  //insert the dungeon
  Dungeons.insertOne(dungeonToInsert,function(err,result){
    if (err){
      console.log(err)
      res.status(422)
    }else{
      console.log('dungeon added')
      console.log(result.insertedId)
      //add the dungeon id to the user's dungeons
      Users.updateOne({username: user}, {$push: {"dungeons": result.insertedId}},function(err,results){
        let firstRoom ={
          user: user,
          dungeon: result.insertedId,
          monsters: [],
          name: "new room"
        }
        Rooms.insertOne(firstRoom,function(err,roomResult){
          console.log('I saved first room')
          //need to update dungeons list
          Dungeons.updateOne({"_id": ObjectId(result.insertedId)}, {$push:{"rooms": roomResult.insertedId}},function(err,resultUpdate){
            res.redirect(`/dungeons/${result.insertedId}`)
          })
        });
      })
    }
  })
}

function sendRooms(req,res,next){
    console.log(req.query.dungeonID)
    let dungeonID = req.query.dungeonID
    //find the dungeon for the room
    htmlToSend = '';

    Dungeons.findOne({"_id": ObjectId(dungeonID)},function(err,result){
      
      let roomResult;
      if (result.rooms.length){
        const roomPromises = result.rooms.map( async (room) =>{
          let roomResult = await Rooms.findOne({"_id": ObjectId(room._id)})
          htmlToSend+= `<div id="${roomResult._id}" class="roomDiv" onclick="changeRoom('${roomResult._id}')" ondrop="dropRoom(event,'${roomResult._id}','${roomResult.name}')" ondragover="allowDrop(event)" name="${roomResult.name}" onclick="changeRoom('${roomResult._id}')">Room: ${roomResult.name}<br><br><button onclick="deleteRoom(event,'${roomResult._id}','${roomResult.name}')">Delete Room</button></div><br>`
          return roomResult;
        })
        Promise.all(roomPromises).then((data)=>{
          res.status(200).send(htmlToSend)
        })
      }
    })
}

function sendSpecificRoom(req,res,next){
  console.log(req.query.roomID)
  Rooms.findOne({"_id": ObjectId(req.query.roomID)}, function(err,result){
    if (result ===null){
      console.log("specific room not found")
    }else{
      let monstersToSend = []
      //console.log(result)
      const monsterPromises = result.monsters.map( async (monster) =>{
        let monsterResult = await Monsters.findOne({"name": monster})
        monstersToSend.push(monsterResult)
        console.log('monster pushed')
        return monsterResult;
      })
      //after all monsters have been found
      Promise.all(monsterPromises).then((data)=>{
        //console.log(monstersToSend)
        console.log('JSON sent for specific room')
        //console.log(result)
        res.status(200).send(JSON.stringify({room:result,monsterData: monstersToSend}))
      })
    }
  })
}


function sendSpecificDungeon(req,res,next){ 
  //console.log(req.params)
  //console.log("HEY THIS IS WHAT DUNGEON ID IS APPARENTLY:")
  //console.log(req.params.dungeonID)
  let dungeonID = String(req.params.dungeonID)
  //console.log(typeof dungeonID)
  //res.render("mainView.pug",{session: req.session,dungeon: testDungeon})
  
  Dungeons.findOne({"_id": ObjectId(dungeonID)}, function(err,result){
    if (!(result === null)){
      //console.log('dungeon found, serving')
      //res.redirect('/main')
      res.render("mainView.pug",{session: req.session,dungeon: result})
    }
  })
  //console.log("im first because im not async")
  
}

function sendDungeons(req,res,next){
  Dungeons.find({user: req.session.username}).toArray(function(err,results){
    if (err){
      console.log(err)
    }
    //there are no dungeons for the user
    if (results.length == 0){
      console.log("i found no dungeons")
      res.render('dungeonSelect.pug', {dungeons: results, noDungeon: true})
    }else{
      console.log("i found dungeons")
      res.render('dungeonSelect.pug',{dungeons: results, noDungeon: false})
    }

  })
}



function serveHome(req,res,next){
  res.render('home.pug',{session: req.session});
}


function serveLoginPage(req,res,next){
  res.render('login.pug',)
}

function serveRegisterPage(req,res,next){
  //not allowed to register if you are logged in
  if (req.session.loggedin){
    res.render("home",{session: req.session})
  }else{
    res.render(`register.pug`);
  }
}

function register(req,res,next){
  let username = req.body.username.toLowerCase();
	let password = req.body.password;

  Users.findOne({"username":username}, function(err,result){
    if (result != null){//if a user is found
      res.render('register.pug',{error: true})
    }else{//if the user is not currently in the db
      //define the new user to be added
      newUser= {
          username: username,
          password: password,
          dungeons: [],
          currentDungeon: ''
      }
      //add the user
      Users.insertOne(newUser,function(err,result){
          if(err) throw err;
          console.log("I added a new user")
          console.log(result);
          //log in user
          req.session.loggedin = true;
          req.session._id= result.insertedId;
          console.log(req.session._id);
          req.session.username = username;
          res.render("home.pug",{session: req.session})
      })
    }
  })
}
//give credit to dave mckenney lecture
function login(req,res,next){
  if(req.session.loggedin){
    res.render("home.pug", {session: req.session})
    return;
  }

  let username = req.body.username;
  let password = req.body.password;
  //console.log("Logging in with credentials:");
  //console.log("Username: " + req.body.username);
  //console.log("Password: " + req.body.password);
  let currUser;
  //try to find the user
  Users.findOne({"username": username}, function(err, result){
  if(err || result == null){//if the user can't be found, rerender page
          //console.log('DIDNT FIND IT')
          res.render("login.pug",{error: "Unauthorized. No username exists"})
      }else{
          //console.log('found it!')
      currUser = result;
          //console.log(currUser)
          //if passwords match
          if(currUser.password === req.body.password){
              req.session.loggedin = true;
              //We set the username associated with this session
              //On future requests, we KNOW who the user is
              //We can look up their information specifically
              //We can authorize based on who they are
              req.session._id= result._id
              req.session.username = username;
              //go to homepage once logged in
              res.render("home.pug", {session: req.session})
          }else{//didnt find a match for password
              res.render("login.pug",{error:"Not authorized. Invalid password."})
          }
      }
  });
}

function logout(req,res,next){

  if(req.session.loggedin){
		req.session.loggedin = false;
    req.session.username = undefined;
        res.render("home.pug", {session: req.session})
	}else{
        res.render("home.pug", {session: req.session})
	}

}


//INCOMPLETE
function saveRoomData(req,res,next){
  //console.log(req.body)
  console.log(req.body.roomName)
  if (!req.body.roomName){
    roomName = 'untitled'
  }else{
    roomName = req.body.roomName
  }
  let roomToSave ={
    user: req.session.username,
    dungeon: req.body.dungeon,
    monsters: req.body.monsters,
    name: roomName
  }
  console.log('about to look for room')
  console.dir({roomToSave})
  Rooms.findOne({name: roomName, user: req.session.username, dungeon: req.body.dungeon}, function(err,result){
    console.log(result)
    if (err){
      console.log(err)
    }
    if(result === null){//room was not found so we need to insert it
      Rooms.insertOne(roomToSave,function(err,result){
        console.log('I saved')
        //need to update dungeons list
        Dungeons.updateOne({"_id": ObjectId(req.body.dungeon)}, {$push:{"rooms": result.insertedId}})
        res.status(200).send(JSON.stringify(result.insertedId));
      });
      
    }
    //room already does exist, so we need to replace/update it
    else{
      Rooms.replaceOne({"_id": ObjectId(result._id)}, roomToSave)
      console.log("I replaced")
      //no need to update dungeons
      res.status(200).send(JSON.stringify(result._id));
    }

  })
  //console.log("roomSaved")
}



function findMonsters(req,res,next){
  let htmlToSend = ``;
  if (req.body.id){
    console.log('I should only find one monster')
  }
  else if (req.query.monsterName || req.query.cr||req.query.ac||req.query.hp||req.query.size||req.query.type||req.query.language||req.query.alignment){
    //console.log(req.query.monsterName)
    //build query
    let queryToSearch = {};
    if (req.query.monsterName){
      queryToSearch.name = {$regex : req.query.monsterName, $options: 'i'}
    }
    if (req.query.cr){
      queryToSearch.challenge_rating = req.query.cr
    }
    if (req.query.ac && !isNaN(req.query.ac)){
      queryToSearch.armor_class = Number(req.query.ac)
    }
    if (req.query.hp && !isNaN(req.query.hp)){
      queryToSearch.hit_points = Number(req.query.hp)
    }
    if (req.query.size){
      queryToSearch.size = {$regex : req.query.size, $options: 'i'}
    }
    if (req.query.type){
      queryToSearch.type = {$regex : req.query.type, $options: 'i'}
    }
    if (req.query.language){
      queryToSearch.languages = {$regex : req.query.language, $options: 'i'}
    }
    if (req.query.alignment){
      queryToSearch.alignment = req.query.alignment.toLowerCase();
    }
    console.log(queryToSearch)
  
    Monsters.find(queryToSearch).toArray(function(err,results){
      if (err){console.log(err)}
      //let htmlToSend = ``;
      for (i = 0; i < results.length; i++){
        monster = results[i];
        htmlToSend += `<div class="monsterDiv" id="${monster._id+(Math.random() * 1000)}" name= "${monster.name}" hp="${monster.hit_points}" cr="${monster.challenge_rating}" draggable="true" ondragstart="drag(event)"> Name: ${monster.name}, Size: ${monster.size}, HP: ${monster.hit_points}, CR: ${monster.challenge_rating}<a target="_blank" class = "monsterLink"  href='/monsters/${monster._id}'>More Info</a></div><br>`
      }
      res.status(200).send(htmlToSend);
     
    })
  }
  //find all monsters
  else{
    db.collection('monsters').find().toArray(function(err,results){
      if (err || results == null){
        console.log('Something went wrong')
      }
      else{
       // console.log("I will send some html now")
        for (i = 0; i < results.length; i++){
          monster = results[i];
          htmlToSend += `<div class="monsterDiv" id="${monster._id+(Math.random() * 1000)}" name= "${monster.name}" hp="${monster.hit_points}" cr="${monster.challenge_rating}" draggable="true" ondragstart="drag(event)"> Name: ${monster.name}, Size: ${monster.size}, HP: ${monster.hit_points}, CR: ${monster.challenge_rating}<br><a target="_blank" class = "monsterLink" href='/monsters/${monster._id}'>More Info</a></div><br>`
        }
        res.status(200).send(htmlToSend)
      }
    })
  }
}

function serveMainViewer(req,res,next){
  res.render('mainView.pug',{session: req.session, dungeon: testDungeon})
}




function serveDungeonSelect(req,res,next){
  //console.log("serving js select code")
  fs.readFile("dungeonSelect.js", function(err, data){
		if(err){
			res.status(500).send("Error.");
			return;
		}
		res.status(200).send(data)
	});

}


function serveDungeonViewer(req,res,next){
  //console.log("serving js view code")
  fs.readFile("dungeonViewer.js", function(err, data){
		if(err){
			res.status(500).send("Error.");
			return;
		}
		res.status(200).send(data)
	});

}

function sendCSS(req,res,next){
  //console.log("serving css code")
	fs.readFile("style.css", function(err, data){
		if(err){
			res.status(500).send("Error.");
			return;
		}
    //console.log("i have sent css data")
		res.status(200).send(data)
	});
}



app.listen(3000);
console.log("Server listening on port 3000");