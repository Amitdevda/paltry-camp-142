const express = require("express")
const jwt = require("jsonwebtoken")
const { createClient } = require("redis");
const { connection } = require("./config/db")
const { UserModel } = require("./model/user.model")
const { user_route } = require("./route/user.route")
const { authenticate } = require("./middleware/auth.middleware.js")
const cookieParser = require('cookie-parser');
const {BlacklistModel} = require("./model/block")
const { Server } = require("socket.io")
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { dex_rout } = require("./route/dexter.routes")
const client = createClient("redis://default:pAZIQGIYzeoDcfPm3PKrPU0gmPWpMeQo@redis-11856.c301.ap-south-1-1.ec2.cloud.redislabs.com:11856")
client.on("error", (err) => console.log("Redis Client Error", err));
const GitHubStrategy = require('passport-github').Strategy;
const passport = require("passport")
const session = require('express-session');
const cors = require("cors")
const app = express()
const fs = require("fs")
app.use(cookieParser());
const path = require('path');
const http = require("http")
app.use(express.json())
client.connect();
app.use(cors({
    origin: "*"
}))


//-------------------------------FOR GUTHUB OAUTH------------------------------------//
app.use(session({
    secret: "a6a74e7dc8023f676a4a9d38cf11de6bcec34933",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
    cb(null, id);
});

passport.use(new GitHubStrategy({
    clientID: "47cdbf9caf20df07fcd7",
    clientSecret: "a6a74e7dc8023f676a4a9d38cf11de6bcec34933",
    callbackURL: "http://localhost:2020/auth/github/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        cb(null, profile)
    }
));

app.get('/auth/github', passport.authenticate('github', { scope: ["profile", "email"] }));

app.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
        const token = jwt.sign({ userId: "imran" }, 'imran', { expiresIn: '1h' });
        client.set("token", token)
        console.log(token)
        // Successful authentication, redirect home.
        res.redirect("http://127.0.0.1:5500/Frontend/dexter(single).html");
    });

//---------------------------GITHUB OAUTH COMPLETED----------------------------------//



//--------------------------TO GET ALL USERS FROM DATABASE-----------------------------//
app.get("/allUsers", async (req, res) => {
    try {
        const data = await UserModel.find({})
        res.send(data)
    } catch (error) {
        res.send(error)
    }
})


//------------------------------USER ROUTE----------------------------------//

app.use("/user", user_route)


//--------------------------FROM HERE AUTHENTICATION STARTS-------------------------//

app.use(authenticate)


//------------------------------FOR LOGOUT---------------------------------------//
app.get("/logout",async (req, res) => {
    const token = await client.get('token')
    const user = new BlacklistModel({token})
    await user.save()
    res.send({"msg":"You are logged out"})
});

//------------------------------FOR CREATING ROOM-------------------------------------//
app.use("/room",dex_rout)


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


//----------------------------------LISTENING AND RUNNING SERVER-----------------------------------//

httpServer.listen(2020 || 3030, async () => {
    try {
        await connection
        console.log("DB connected");
    } catch (error) {
        console.log(error);
        console.log("DB dose not connected");
    }
    console.log("Port @ localhost:2020");
})

//--------