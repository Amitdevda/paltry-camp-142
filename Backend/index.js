const express = require("express")
const jwt = require("jsonwebtoken")
const { createClient } = require("redis");
const { connection } = require("./config/db")
const { UserModel } = require("./model/user.model")
const { user_route } = require("./route/user.route")
const { authenticate } = require("./middleware/auth.middleware.js")
// const cookieParser = require('cookie-parser');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const {BlacklistModel} = require("./model/block")
const { Server } = require("socket.io")
var cookieParser = require('cookie-parser')
const { dex_rout } = require("./route/dexter.routes")
const GitHubStrategy = require('passport-github').Strategy;
const passport = require("passport")
const session = require('express-session');
const cors = require("cors")
const app = express()
app.use(cookieParser())
const fs = require("fs")
const path = require('path');
const http = require("http")
app.use(express.json())
app.use(cors({
    origin: "*"
}))


//-------------------------------FOR GUTHUB OAUTH-----------------------------------//
app.use(session({
    secret: "a6a74e7dc8023f676a4a9d38cf11de6bcec34933",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

    let client_id="47cdbf9caf20df07fcd7"
    let client_secret="a6a74e7dc8023f676a4a9d38cf11de6bcec34933"
app.get("/",(req,res)=>{
    res.clearCookie("tokn")
    const token = jwt.sign({ userId: "user[0]._id" }, "imran", {
        expiresIn: "10h",
    });
    res.cookie("tokn", token).send({ msg: "Login successful", token: token });
})
app.get("/get",(req,res)=>{
    var Cookie = req.headers.cookie;
    // let t=req.cookie("tokn")
    res.send({"msg":Cookie})
})



app.get("/auth/github", async(req,res)=>{
    const token = jwt.sign({ userId: "imran" }, "imran", {
        expiresIn: "10h",
    });
    fs.writeFileSync("token.txt", token);
    const {code}= req.query
    console.log(code)
    const accesstoken= await fetch("https://github.com/login/oauth/access_token",{
        method:"POST",
        headers:{
            Accept:"application/json",
            "content-type":"application/json"
        },
        body:JSON.stringify({
            client_id:client_id,
            client_secret:client_secret,
            code:code
        })
    }).then((res) => res.json())
    const acces=accesstoken.access_token
    const userdetails= await fetch("https://api.github.com/user",{
        headers:{
            Authorization: `Bearer ${acces}`
        }
    }).then((res) => res.json())
    console.log(userdetails)
    res.redirect("https://6461df325d790220ca98b49e--curious-licorice-7e88d0.netlify.app/dexter(single).html")
})


//---------------------------GITHUB OAUTH COMPLETED----------------------------------//


//------------------------------USER ROUTE----------------------------------//

app.use("/user", user_route)

//------------------------------FOR CREATING ROOM-------------------------------------//

app.use("/room",dex_rout)

//--------------------------FROM HERE AUTHENTICATION STARTS-------------------------//

app.use(authenticate)


//--------------------------TO GET ALL USERS FROM DATABASE-----------------------------//
app.get("/allUsers", async (req, res) => {
    try {
        const data = await UserModel.find({})
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})



//------------------------------FOR LOGOUT---------------------------------------//
app.get("/usr/logout" ,async (req,res)=>{
    let token= fs.readFileSync("token.txt",{ encoding: 'utf8'})
    let user = new BlacklistModel({token})
    await user.save()
    res.send({"msg":"You are logged out",token})

})

//----------------------------WEB SOCKET------------------------------------//
const httpServer = http.createServer(app)
const wss = new Server(httpServer)
let clientArr=[]
wss.on("connection", (socket) => {
    console.log("new client connected")
    socket.on("join", ({ username, room }) => {
        dis = 1;
        let id = socket.id
        let user = { id, username, room }
        clientArr.push(user)
        socket.join(user.room);
        wss.to(user.room).emit("disc", {
            room: user.room, users: user.username, dis: 1
        })
        wss.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })
    })

    socket.on("chatMessage", (data) => {
        socket.broadcast.emit("msgd", data)
        socket.emit("mymsg", data)

    });
    function getRoomUsers(room) {
        return clientArr.filter(user => user.room == room)
    }


    //========================till-here=============================//

    socket.on("html", (data) => {
        console.log(data)
        socket.broadcast.emit("fst", data)
    })
    socket.on("css", (data) => {
        console.log(data)
        socket.broadcast.emit("fstcss", data)
    })
    socket.on("js", (data) => {
        socket.broadcast.emit("fstjs", data)
    })
    socket.on("write_html", ({ room_id, code }) => {
        socket.broadcast.to(room_id).emit("write_html", { code })
    });
    socket.on("write_css", ({ room_id, code }) => {
        socket.broadcast.to(room_id).emit("write_css", { code })
    });
    socket.on("write_js", ({ room_id, code }) => {
        socket.broadcast.to(room_id).emit("write_js", { code })

        socket.on("ad", (data) => {
            socket.broadcast.emit("a", data)
            socket.emit("a", data)
        })
    });
    socket.on("disconnect", () => {
        const user = userLeave(socket.id)
        wss.to(user.room).emit("disc", {
            room: user.room, users: user.username, dis: 0
        })
        wss.to(user.room).emit("roomUsers", {
            room: user.room, users: getRoomUsers(user.room)
        })
    })
    function userLeave(id) {
        const index = clientArr.findIndex(user => user.id == id)
        if (index !== -1) {
            return clientArr.splice(index, 1)[0]
        }
    }
})


//------------------------------LISTENING AND RUNNING SERVER-----------------------------------//

httpServer.listen(2020 , async () => {
    try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
        console.log("DB dose not connected");
    }
    console.log("Port @ localhost:2020");
})

