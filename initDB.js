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

  
  db.listCollections().toArray(function(err, result){
    //INITIALIZE DB
    if(result.length == 0){
      console.log("making db for the first time")
      db.collection("monsters").insertMany(monsters, function(err, result){
       if(err){
         throw err;
       }
       
       console.log(result.insertedCount + " monsters successfully added (should be 326).");
       client.close();
     });
     return;
    }

	 let numDroppedMonsters = 0;
	 let toDrop = result.length;
   //REFRESHING DB
	 result.forEach(collection => {
		db.collection(collection.name).drop(function(err, delOK){
			if(err){
				throw err;
			}
			
			console.log("Dropped collection: " + collection.name);
			numDroppedMonsters++;
			
			if(numDroppedMonsters == toDrop){
				db.collection("monsters").insertMany(monsters, function(err, result){
					if(err){
						throw err;
					}
					
					console.log(result.insertedCount + " monsters successfully added (should be 326).");
					client.close();
				});
			}
		});		
	 });

  })
} 
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
              //console.log(monsters[0])
              //console.log(monsters.length)
              
              return monsters
            }
      });

      return monstersSend;
}

function main(){
    readMonsterData()
}


main()