
let mongoose = require('mongoose');

let imageSchema = new mongoose.Schema({
    room: String,
    dungeon: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
});

module.exports = new mongoose.model('Image',imageSchema)