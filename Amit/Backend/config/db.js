const mongoose = require("mongoose")

const connection = mongoose.connect("mongodb+srv://ashwin:been12345@cluster0.3lftd4b.mongodb.net/dextorite?retryWrites=true&w=majority")

module.exports = {connection}