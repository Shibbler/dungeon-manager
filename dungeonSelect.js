/*
function makeNewDungeon(){
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200){
            //console.log(this.response)
            //console.log(document.body)
            console.log("received")
            console.log(this.response)
            loadDungeonPage(this.response)
        }
    }
    console.log(document.getElementById('dungeonNameField').value)
    req.open("POST", `/dungeons/${document.getElementById('dungeonNameField').value}`);
    req.setRequestHeader("Content-Type", "text/html")
    req.send();
}

function loadDungeonPage(dungeonID){
    let req = new XMLHttpRequest();
    //read html data and update page accordingly.
    req.onreadystatechange = function() {
        if(this.readyState==4 && this.status==200){
            //console.log(this.response)
            //console.log(document.body)
            console.log("rendered new page")
            console.log(this.response)
            document.body.parentNode.innerHTML = this.response
        }
    }
    console.log("Im here")
    req.open("GET", `/dungeons/${dungeonID}`);
    req.setRequestHeader("Content-Type", "text/html")
    req.send();
}
*/