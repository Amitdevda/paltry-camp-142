const express = require("express")
const {connection} = require("./config/db")
const {user_route} = require("./route/user.route")
const {authenticate} = require("./middleware/auth.middleware")
const http = require("http")
const path = require('path');
const redis = require("redis")
const { Server } = require("socket.io")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { dex_rout } = require("./route/dexter.routes")

const client_id="23ca205a4e951b3d0464"
const client_secret="a40831240ce5aeab012a248c9e5069152dcf2976"

const client= redis.createClient();
client.on('error', err => console.log('Redis Client Error', err));
client.connect();




const fs = require("fs")
const app = express()
app.use(express.json())
 const cors = require("cors")
app.use(cors({
  origin:"*"
}))



app.use("/",user_route)
app.use(authenticate)
app.use('/',dex_rout)



app.get("/welcome",(req,res)=>{
        res.sendFile(__dirname + "/signin.html");
})

app.get("/home", (req, res) => {
    res.send("Home...")
})

app.get("/room",async(req,res)=>{
  const{code}=req.query
  const accesstoken=await fetch("https://github.com/login/oauth/access_token",{
      method:"POST",
      headers:{
          Accept: "application/json",
          "content-type":"application/json"
        },
        body: JSON.stringify({
    client_id:client_id,
    client_secret:client_secret,
    code
    })
  }).then((res)=>res.json())
  const access_token=accesstoken.access_token
//   console.log(code);
  // connect room  here

    const userdetails=await fetch("https://api.github.com/user",{
        headers:{
            Authorization: `Bearer ${access_token}`,
        }
    }).then((res)=>res.json())
    
    
    // console.log(userdetails.email);
    console.log(userdetails.name);
    fs.writeFileSync("name.txt",userdetails.name)
    
    const userEmail = await client.SET("userEmail",`${userdetails.email}`)
    console.log(userEmail);
   
   
    res.sendFile(path.join(__dirname, "../dexterlab.html"));
})



// app.get("/rooms",(req,res)=>{
//     res.sendFile(path.join(__dirname, "../dexterlab.html"));
// })
// app.get("/dexterlab",(req,res)=>{
//     res.sendFile(path.join(__dirname, "../dexterlab.html"));
// })


const httpServer = http.createServer(app)

httpServer.listen(2020,async ()=>{
     try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
        console.log("DB dose not connected");
    }
    console.log("Port @ localhost:2020");
})

const wss = new Server(httpServer)

let clientArr = []
let name ;
let dis;
wss.on("connection", (socket) => {

    console.log("client connected")

    // socket.on("msg", (data) => {
    //     socket.broadcast.emit("msgd", data)
    //     socket.emit("mymsg", data)
    // })

    ///=====================mycode======================================
    socket.on("join", ({username,room}) => {
        dis=1;
        let id= socket.id
        let user = {id,username,room}
        clientArr.push(user)
        socket.join(user.room);

        wss.to(user.room).emit("disc", {
            room: user.room, users: user.username, dis: 1
        })
        
    })

    socket.on("chatMessage",(data)=>{
              socket.broadcast.emit("msgd", data)
              socket.emit("mymsg", data)

  });
//   function getRoomUsers(room) {
//     return clientArr.filter(user=> user.room == room)
//  }


  //========================till-here=============================
    
    socket.on("html", (data) => {
        console.log(data)
        socket.broadcast.emit("fst", data)
    })

    socket.on("css", (data) => {
        console.log(data)
        socket.broadcast.emit("fstcss", data)
    })

    socket.on("js", (data) => {
        // console.log(data)
        socket.broadcast.emit("fstjs", data)
        // socket.emit("pullhtml", data)
    })
    
        //event for writting code
        socket.on("write_html", ({room_id, code }) => {
            socket.broadcast.to(room_id).emit("write_html",{code})
    
        });
        socket.on("write_css", ({room_id, code }) => {
            socket.broadcast.to(room_id).emit("write_css",{code})
            
        });
        socket.on("write_js", ({room_id, code }) => {
            socket.broadcast.to(room_id).emit("write_js",{code})
    

    socket.on("ad", (data) => {
        // console.log(data)
        socket.broadcast.emit("a", data)
        socket.emit("a", data)
    })
    });
    socket.on("disconnect",()=>{
        
        const user = userLeave(socket.id)
          //  Get all room user
          console.log(user.username + "  has left the lab")
          wss.to(user.room).emit("disc", {
            room: user.room, users: user.username, dis:0
        })

    })
    function userLeave(id){
        const index = clientArr.findIndex(user=>user.id==id)
        if(index !== -1) {
            return clientArr.splice(index,1)[0]
        }
    }
})

