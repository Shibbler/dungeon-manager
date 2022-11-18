# dungeon-manager

To run the database server:

    Open a terminal and enter "mongod --dbpath=[PATHTODBFOLDER]", where [PATHTODBFOLDER], including the [], should be replaced with the path to the database folder you want to use

To initiliaze the database with basic monster information (or reset the db):
    run "node initDB.js" in a terminal, ensure the mongo server is running

To run the server:
    run "npm start", ensure the mongo server is running

To view the webpage, go to the url: "localhost:3000" in a webbrowser