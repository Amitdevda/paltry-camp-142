const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const fs = require("fs")
const app = express()

app.get("/",(req,res)=>{
    res.send("Welcome")
})

app.get("/home",(req,res)=>{
    res.send("Home...")
})

const httpServer = http.createServer(app)

httpServer.listen(8000)

const wss = new Server(httpServer)

let clientArr = []
let name = ""

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
        console.log(clientArr,data)
        socket.broadcast.emit("online", clientArr)
        socket.emit("online", clientArr)
    })
    
    socket.on("dis", async (name) => {
        for (let i = 0; i < clientArr.length; i++) {
            if (clientArr[i] == name) {
                await clientArr.splice( (i-1) , 1)
            }
        }
        socket.broadcast.emit("disc", clientArr)
        socket.emit("disc", clientArr)
    })
})
