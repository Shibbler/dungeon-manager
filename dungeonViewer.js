
function init(){
	//console.log("ya got me")
    calculateRoomStats();
    populateRoomField();

    
}


function getMap(){
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log(this.response)
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


function loadMapImage(roomID){
    console.log(roomID)
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
        newHtml+=`<li id="${monster._id+(Math.random() * 1000)}" name= "${monster.name}" hp="${monster.hit_points}" cr="${monster.challenge_rating}" draggable="true" ondragstart="drag(event)"> Name: ${monster.name}, Size: ${monster.size}, HP: ${monster.hit_points}, CR: ${monster.challenge_rating}</li>`
    }
    document.getElementById('monsterDisplay').innerHTML = newHtml
    calculateRoomStats()
    //maybe bad place for this
    loadMapImage(room._id)

   
    
}


function populateRoomField(){
    console.log("calling for room data")
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
	req.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("loading new rooms")
            console.log(this.response)
            document.getElementById("roomsInDungeon").innerHTML =this.response;
        }
	}
    console.log('opening new room call')
    req.open("GET", `/rooms?dungeonID=${document.getElementById('dungeonID').value}`);
    req.setRequestHeader("Content-Type", "text/html")
	req.send();
}

function changeRoom(id){
    console.log('id')
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
    newItem = `<li id="${data+(Math.random() * 1000)}" name="${monsterData.getAttribute("name")}" hp = "${monsterData.getAttribute("hp")}" cr="${monsterData.getAttribute("cr")}"  draggable="true" ondragstart="drag(event)"> ${document.getElementById(data).textContent} </li>`
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


function calculateRoomStats(){
    let monstersInRoom = document.getElementById("monsterDisplay").getElementsByTagName("li");
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
            populateRoomField();
        }
	}
    let monstersInRoom = document.getElementById("monsterDisplay").getElementsByTagName("li");
    let monstersToSave = [];
    for (i = 0; i<monstersInRoom.length;i++){
       monstersToSave.push(monstersInRoom[i].getAttribute("name"))
    }
    //console.log(monstersToSave)
    req.open("post", `/roomSave`);
    req.setRequestHeader("Content-Type", "application/json")
	req.send(JSON.stringify({monsters: monstersToSave, dungeon: `${document.getElementById('dungeonID').value}`, roomName: document.getElementById("roomName").value}));
}