
function init(){
	//console.log("ya got me")
    calculateRoomStats();
    populateRoomField();

    
}


function deleteRoom(event,id,name){
    if (name === document.getElementById("roomName").value){
        console.log('trying to delete current room');
        alert("Trying to delete current room, not allowed")
        return;
    }
    event.stopPropagation();
    //console.log(id,name)
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log('room removed')
            populateRoomField()
            
        }
	}
    req.open("POST", `/deleteRoom`);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify({roomID: id, roomName: name, dungeon: document.getElementById('dungeonID').value}));
}

function getMap(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            //console.log(this.response)
            document.getElementById("mapDisplay").innerHTML = this.response
        }
	}
    console.log(document.getElementById('dungeonID').value)
    console.log(document.getElementById('roomName').value)
    
    let dungeon= document.getElementById('dungeonID').value 
    let roomName = document.getElementById("roomName").value

    req.open("GET", `/map?dungeon=${dungeon}&roomName=${roomName}`);
    req.setRequestHeader("Content-Type", "text/html")
	req.send();
}


function submitMap(){
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            document.getElementById("mapDisplay").innerHTML = this.response

        }
	}
    const formData = new FormData();
    formData.append("roomName",document.getElementById("roomName").value)
    formData.append("dungeon",document.getElementById('dungeonID').value)
    formData.append("image", document.getElementById("image").files[0])
    //console.log(document.getElementById("image").files[0])
    req.open("POST", `/map`);
	req.send(formData);
}


function newRoom(){
    document.getElementById("currentRoomName").innerHTML = `Current Room: New Room`
    document.getElementById("roomName").value = "new room"
    document.getElementById('monsterDisplay').innerHTML = '<div id="roomStats"></div>'
    document.getElementById("mapDisplay").innerHTML = "No Map for this room"
    calculateRoomStats()
}


function loadRoomData(data){
    //console.log(data)
    data = JSON.parse(data)
    room = data.room
    monsterInfo = data.monsterData
    //console.log(room)
    //console.log(monsterInfo)
    document.getElementById("currentRoomName").innerHTML = `Current Room: ${room.name}`
    document.getElementById("roomName").value = room.name
    getMap();
    //populate the monsters in rooms field
    newHtml = '<div id="roomStats"></div>'
    for (monster of monsterInfo){
        //console.log(monster)
        newHtml+=`<div class="monsterInRoom" id="${monster._id+(Math.random() * 1000)}" name= "${monster.name}" hp="${monster.hit_points}" cr="${monster.challenge_rating}" draggable="true" ondragstart="drag(event)"> Name: ${monster.name}, Size: ${monster.size}, HP: ${monster.hit_points}, CR: ${monster.challenge_rating}</div><br>`
    }
    document.getElementById('monsterDisplay').innerHTML = newHtml
    calculateRoomStats()

    
}


function populateRoomField(){
    console.log("calling for room data")
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("loading new rooms")
            //console.log(this.response)
            document.getElementById("roomsInDungeon").innerHTML =this.response;
        }
	}
    console.log('opening new room call')
    req.open("GET", `/rooms?dungeonID=${document.getElementById('dungeonID').value}`);
    req.setRequestHeader("Content-Type", "text/html")
	req.send();
}

function changeRoom(id){
    //console.log('id')
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
           
           loadRoomData(this.response)
        }
	}

    req.open("GET", `/room?roomID=${id}`);
    req.setRequestHeader("Content-Type", "text/html")
	req.send();
}


function searchVault(){
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            document.getElementById("monstersInVault").innerHTML=this.response;
        }
	}
    nameForSearch = document.getElementById("monsterNameSearch").value
    challengeRating = document.getElementById("monsterChallengeSearch").value
    ac = document.getElementById("monsterArmourSearch").value
    hp = document.getElementById("monsterHpSearch").value
    size = document.getElementById("monsterSizeSearch").value
    type = document.getElementById("monsterTypeSearch").value
    language = document.getElementById("monsterLanguageSearch").value
    alignment = document.getElementById("monsterAlignmentSearch").value

    //console.log(nameForSearch)
    let searchCondition = ''
    let needsAmp = false
    //build the query
    if (nameForSearch){
        //console.log("I am adding to search NAME")
        searchCondition+=`monsterName=${nameForSearch}`
        needsAmp = true;
    }
    if (challengeRating){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`cr=${challengeRating}`
        needsAmp = true;
    }
    if (ac){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`ac=${ac}`
        needsAmp = true;
    }
    if (hp){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`hp=${hp}`
        needsAmp = true;
    }
    if (size){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`size=${size}`
        needsAmp = true;
    }
    if (type){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`type=${type}`
        needsAmp = true;
    }
    if (language){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`language=${language}`
        needsAmp = true;
    }
    if (alignment){
        if (needsAmp){
            searchCondition+="&"
        }
        //console.log("I am adding to search CR")
        searchCondition+=`alignment=${alignment}`
        needsAmp = true;
    }
    //console.log(searchCondition);
	//Send a get request for new data so we can access the db
	req.open("GET", `/monsters?${searchCondition}`);
    req.setRequestHeader("Content-Type", "text/html")
	req.send();
}


//should add something to drop to only allow from and to certain areas, some checks to see if it came from right area etc

function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drag(ev) {
    //console.log(ev.target.id)
    ev.dataTransfer.setData("text", ev.target.id);

    //console.log(ev.dataTransfer.getData())
  }
  
  function drop(ev) {
    //console.log(`dropping: ${ev}`)
    ev.preventDefault();
    //essentially make a new object to be used
    var data = ev.dataTransfer.getData("text");
    let monsterData = document.getElementById(data)
    //console.log(monsterData)

    //console.log(data)
    //ev.target.appendChild(document.getElementById(data));
    newItem = `<div class="monsterInRoom" id="${data+(Math.random() * 1000)}" name="${monsterData.getAttribute("name")}" hp = "${monsterData.getAttribute("hp")}" cr="${monsterData.getAttribute("cr")}"  draggable="true" ondragstart="drag(event)"> ${document.getElementById(data).textContent} </div><br>`
    ev.target.innerHTML += newItem
    calculateRoomStats()
  }

  function dropVault(ev) {
    //console.log(`dropping: ${ev}`)
    ev.preventDefault();
    //essentially make a new object to be used
    var data = ev.dataTransfer.getData("text");
    //console.log(data)
    document.getElementById("monsterDisplay").removeChild(document.getElementById(data));
    calculateRoomStats()
  }

  //move a monster from current room to a different room, user still has to save their current room
  function dropRoom(ev,id,name){
    if (name === document.getElementById("roomName").value){
        console.log('trying to add to new room'); 
        return;
    }
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
          console.log('done monster room change')
          document.getElementById("monsterDisplay").removeChild(document.getElementById(data));
        }
	}
    console.log(`dropping room: ${ev}`)
    var data = ev.dataTransfer.getData("text");
    console.log(data)
    monsterName = document.getElementById(data).getAttribute('name')
    console.log(monsterName)
    //document.getElementById("monsterDisplay").removeChild(document.getElementById(data));

    req.open("POST", `/room/monster`);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify({monster: monsterName, roomID: id}));

  }


function calculateRoomStats(){
    let monstersInRoom = document.getElementById("monsterDisplay").getElementsByClassName("monsterInRoom");
    let totalCr = 0;
    let totalHp = 0;
    //console.log(monstersInRoom.length)
    for (i = 0; i<monstersInRoom.length;i++){
        cr = monstersInRoom[i].getAttribute("cr")
        //fix for fractional CR
        if (cr === "1/8"){
            cr = 0.125
        }
        if (cr === "1/4"){
            cr = 0.25
        }
        if (cr === "1/2"){
            cr = 0.5
        }
        totalCr += Number(cr)
        totalHp += Number(monstersInRoom[i].getAttribute("hp"))
    }
    document.getElementById("roomStats").innerHTML = `<h3 id= "roomStats" totHp="${totalHp}" totCr="${totalCr}"> Current Room Stats ~ HP: ${totalHp}, CR: ${totalCr} `
}



function saveRoom(){

    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log('saved')
            populateRoomField()
            console.log(JSON.parse(this.response))
            changeRoom(JSON.parse(this.response))
        }
	}
    let monstersInRoom = document.getElementById("monsterDisplay").getElementsByClassName("monsterInRoom");
    let monstersToSave = [];
    for (i = 0; i<monstersInRoom.length;i++){
       monstersToSave.push(monstersInRoom[i].getAttribute("name"))
    }
    //console.log(monstersToSave)
    req.open("post", `/roomSave`);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify({monsters: monstersToSave, dungeon: `${document.getElementById('dungeonID').value}`, roomName: document.getElementById("roomName").value}));
}