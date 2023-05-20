const express = require("express")
const dex_rout = express.Router()
dex_rout.use(express.json())
const cors = require("cors")
// app.use(cors({
//     origin: "*"
// }))

dex_rout.get("/c_room",async(req,res)=>{
    res.send({"msg":"ok"});
})

dex_rout.get("/lab",(req,res)=>{
    res.sendFile(__dirname + "/../dexterlab.html");
})

module.exports={
    dex_rout
}