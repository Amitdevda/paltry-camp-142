const mongoose = require("mongoose")
require('dotenv').config()

const connection = mongoose.connect(`mongodb+srv://${process.env.mongo_uid}:${process.env.mongo_pass}@cluster0.0sroy.mongodb.net/dexterDB?retryWrites=true&w=majority`)

module.exports = {connection}