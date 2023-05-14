const mongoose = require("mongoose")
// require('dotenv').config()

const connection = mongoose.connect("mongodb://imrans:imrans@ac-a69msxr-shard-00-00.tbycsjm.mongodb.net:27017,ac-a69msxr-shard-00-01.tbycsjm.mongodb.net:27017,ac-a69msxr-shard-00-02.tbycsjm.mongodb.net:27017/Dexter?ssl=true&replicaSet=atlas-10faq7-shard-0&authSource=admin&retryWrites=true&w=majority")

module.exports = {connection}