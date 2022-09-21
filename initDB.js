//mongod --dbpath=C:\Users\Owner\Documents\GitHub\dungeon-manager\db


const fs = require("fs");

let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;


//globals
let monsters = [];
let monsterToAdd = [];



MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;

  db = client.db('dungeonManager');

  //attempt to insert monsters to array
  db.listCollections().toArray(function(err, result){
    if(result.length == 0){
      db.collection("monsters").insertMany(monsters, function(err, result){
       if(err){
         throw err;
       }
       
       console.log(result.insertedCount + " monsters successfully added (should be 326).");
       client.close();
     });
     return;
    }

  })} 
) 

function readMonsterData(){//read all data from the monster JSON file.
    let monstersSend = fs.readFile("monsters.json", 'utf-8', function(err, content) {
            if (err) {
              console.log(`ERROR ON ACCESS`);
              return;
            }
            else{//if all goes smoothly
              monsterToAdd = JSON.parse(content);//load the file content as a JSON file
              monsterToAdd.forEach(product=>{
                monsters.push(product);
              })
              console.log(monsters[0])
              console.log(monsters.length)
              
              return monsters
            }
      });

      return monstersSend;
}

function main(){
    readMonsterData()
}


main()