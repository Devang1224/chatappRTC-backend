const express = require("express");
const mongoose = require("mongoose")
const userRoute = require("./routes/user")
const conversationRoute = require("./routes/conversation")
const cors = require('cors')
const connectDB = require('./Db/db');
const socketio = require('socket.io');
const http = require('http');

const app = express();

app.use(cors({
    origin: "https://chatrtc.netlify.app"
  }));
app.use(express.json());

require('dotenv').config()
connectDB(); //establishing mongodb connection

const server = http.createServer(app);
const io = socketio(server, {
    cors: {
      origin: "https://chatrtc.netlify.app",
      methods: ["GET", "POST"]
    }
  });;



app.use("/user",userRoute);
app.use("/chat",conversationRoute)

const userToSocket = new Map();
const socketToUser = new Map();

io.on("connection", (socket) => {

    console.log("new user connected");

    socket.emit("connected","message from the server")
   
    socket.on("privateChat",(data)=>{  
      const{convoid:roomId,username:User} = data;          // roomId is convoId  ( destructring of objects)
        userToSocket.set(User,socket.id);
        socketToUser.set(socket.id,User);
        socket.join(roomId);
        console.log((`user connected with convo id :${roomId}`));


    })
      
   // when a user press the videocall button 
    socket.on("enterVideoCall",(data)=>{
      const{convoId:roomId,User} = data;          // roomId is convoId  ( destructring of objects)
    socket.broadcast.to(roomId).emit("user-joined",{User,id:socket.id});

    })

socket.on("user:call", ({ to, offer }) => {
  io.to(to).emit("incomming:call", { from: socket.id, offer });
});

socket.on("call:accepted", ({ to, ans }) => {
  io.to(to).emit("call:accepted", { from: socket.id, ans });
});

socket.on("peer:nego:needed", ({ to, offer }) => {
  console.log("peer:nego:needed", offer);
  io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
});

socket.on("peer:nego:done", ({ to, ans }) => {
  console.log("peer:nego:done", ans);
  io.to(to).emit("peer:nego:final", { from: socket.id, ans });
});








    //sending messages
    socket.on("newMessage",(message)=>{
       io.to(message.conversationId).emit('Message', message);
    })
    //sending messages

  });


  server.listen(process.env.PORT || 6010 , () => console.log(`Server has started.`));
  // || 6010