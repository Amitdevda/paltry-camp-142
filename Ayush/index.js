const express=require("express")
const http=require("http")
const socketIo=require("socket.io")
require("dotenv").config()

const app=express()
const server=http.createServer(app)
const io=socketIo(server)

app.get("/",(req,res)=>{
    res.send("Home Page")
})

const socket_map={}
function getAlluser(room_id){
    return Array.from(io.sockets.adapter.rooms.get(room_id)||[]).map(
        (socket_id)=>{
            return{
                socket_id,
                username: socket_map[socket_id],
            }
        }
    )
}

//connection making
io.on("connection",(socket)=>{
    console.log("socket connected", socket.id);

    socket.on("join",({room_id, username})=>{
        console.log(room_id,username)
    })

    socket.on("disconnect",()=>{
        const rooms=[...socket.rooms]
        rooms.forEach((room_id)=>{
            socket.in(room_id).emit("disconnected",{
                socketId: socket.id,
                username:socket_map[socket.id],
            })
        })
        // delete socket_map[socket.id];
        // socket.leave();
    })
})

server.listen(4500,()=>{
    console.log("Running at port");
})

