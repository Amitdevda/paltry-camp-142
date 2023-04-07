const express = require("express")
const dex_rout = express.Router()


dex_rout.get("/c_room",(req,res)=>{
    res.sendFile(__dirname + "/../createroom.html");

})

dex_rout.get("/lab",(req,res)=>{
    // res.sendFile(__dirname + "/../dexterlab.html");
})

module.exports={
    dex_rout
}