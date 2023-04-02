const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const fs = require("fs")
const app = express()

app.get("/", (req, res) => {
    res.send("Welcome")
})

app.get("/home", (req, res) => {
    res.send("Home...")
})

const httpServer = http.createServer(app)

httpServer.listen(8000)

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

