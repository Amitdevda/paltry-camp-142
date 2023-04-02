const express = require("express")
const {connection} = require("./config/db")
const {user_route} = require("./route/user.route")
const {authenticate} = require("./middleware/auth.middleware")
const http = require("http")
const path = require('path');
const redis = require("redis")
const { Server } = require("socket.io")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


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


app.get("/", (req, res) => {
    res.send("Welcome")
})

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

app.get("/rooms",(req,res)=>{
     res.sendFile(path.join(__dirname, "../dexterlab.html"));
})


app.use(authenticate)

app.get("/dexterlab",(req,res)=>{
    res.sendFile(path.join(__dirname, "../dexterlab.html"));
})


app.get("/logout", async(req, res) => {
   const token = await client.GET("token")
    //redis
    if(!token){
        res.send("token expired login again")
    }else{
        await client.SADD("logout", token)
        //file
            // const blacklisted_data = JSON.parse(fs.readFileSync("./blacklist.json","utf-8"));
            // blacklisted_data.push(token)
            // fs.writeFileSync("./blacklist.json", JSON.stringify(blacklisted_data))
        // console.log(blacklisted_data);
        res.send("Logout successfully");
    }

})


const httpServer = http.createServer(app)




httpServer.listen(8000,async ()=>{
     try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
        console.log("DB dose not connected");
    }
    console.log("Port @ localhost:8000");
})

const wss = new Server(httpServer)

let clientArr = []
let name = ""


//check for the users and scoket
// const socket_map={}
// function getAlluser(room_id){
//     return Array.from(io.sockets.adapter.rooms.get(room_id)||[]).map(
//         (socket_id)=>{
//             return{
//                 socket_id,
//                 username: socket_map[socket_id],
//             }
//         }
//     )
// }



wss.on("connection", (socket) => {
    // socket.emit("put",clientArr)
    console.log("client connected")
    socket.on("msg", (data) => {
        socket.broadcast.emit("msgd", data)
        socket.emit("msgd", data)
        // console.log(data)
    })

    socket.on("join", (data) => {
        console.log(data)
        clientArr.push(data)
        name = data
        console.log(clientArr, data)
        socket.broadcast.emit("online", clientArr)
        socket.emit("online", clientArr)
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


    socket.on("css", (data) => {
        // console.log(data)
        socket.broadcast.emit("fstcss", data)
    })

    socket.on("js", (data) => {
        // console.log(data)
        socket.broadcast.emit("fstjs", data)
        // socket.emit("pullhtml", data)
    })

    socket.on("ad", (data) => {
        // console.log(data)
        socket.broadcast.emit("a", data)
        socket.emit("a", data)
    })
    });

    socket.on("sync_code", (socketId, code) => {
        io.to(socketId).emit("code_change", { code });
    });



    socket.on("dis", async (name) => {
        for (let i = 0; i < clientArr.length; i++) {
            if (clientArr[i] == name) {
                await clientArr.splice((i - 1), 1)
            }
        }
        socket.broadcast.emit("disc", clientArr)
        socket.emit("disc", clientArr)
    })
})

