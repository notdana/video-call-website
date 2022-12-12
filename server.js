const express = require("express")
const app = express()
const server = require("http").Server(app)
const io = require("socket.io")(server)
const {v4: uuidv4} = require('uuid')

app.set('view engine', 'ejs')
app.use(express.static("public"))

app.get("/", (req,res)=>{
    res.redirect(`/${uuidv4()}`)
})

app.get("/:room", (req,res)=>{
    res.render('room', {roomId: req.params.room})
})

//run everytime someone connects
io.on("connection", socket=>{
    //the events you want to listen to
    socket.on('join-room', (roomId, userId)=> {
        //console.log(roomId,userId)

        //join room 
        socket.join(roomId)
        //send msg to room to everyone
        socket.to(roomId).emit('user-connected', userId);

        socket.on('disconnect', ()=>{
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)