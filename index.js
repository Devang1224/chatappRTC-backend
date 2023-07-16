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


//sender -> receiver

io.on("connection", (socket) => {

    console.log("new user connected");

    socket.emit("connected","message from the server")

socket.on("userJoinedTheChat",(data)=>{  
  const {User} = data;
  userToSocket.set(User,socket.id);
  socketToUser.set(socket.id,User);
})

   
    socket.on("privateChat",(data)=>{  
      const{convoid:roomId,username:User} = data;          // roomId is convoId  ( destructring of objects)
        userToSocket.set(User,socket.id);
        socketToUser.set(socket.id,User);
        socket.join(roomId);
        console.log((`user connected with convo id :${roomId}`));


    })
      
   // when a user press the videocall button 
    socket.on("roomJoined",(data)=>{
      const{convoId:roomId,User,Receiver} = data;   // roomId is convoId  ( destructring of objects)
    // socket.broadcast.to(roomId).emit("user-joined",{User,id:socket.id}); // id=jatin

    const receiverid = userToSocket.get(Receiver)
    io.to(receiverid).emit("user-joined",{User,id:socket.id});

    const UserId = userToSocket.get(User)
    io.to(UserId).emit("setremoteidfor-user",{Receiver,receiverid}); // this is sending the receiver's socket id back to the user
    //consoling
    const user = socketToUser.get(socket.id)
    console.log("1",user,socket.id);
    })

socket.on("modalaccepted",({to})=>{
  
io.to(to).emit("youcancallusernow");

})


socket.on("user:call", ({from,to, offer }) => {
    // io.to(to).emit("incomming:call", { from: socket.id, offer }); // to=devangid from jatinid
   if(to){
    console.log('incoming call ',from,to,offer);
    io.to(to).emit("incomming:call", { from: socket.id, offer });
   }
    //consoling
    const user = socketToUser.get(socket.id)
    console.log("2",user,socket.id);
});

socket.on("call:accepted", ({ to, ans }) => {
    
    console.log("devang to jatin",to,ans);

    io.to(to).emit("call:accepted", { from: socket.id, ans });  // to=jatin from devangs id 

    const user = socketToUser.get(socket.id)
    console.log("3",user,socket.id);
});

socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });    // to devang
    const user = socketToUser.get(socket.id)
    console.log("4",user,socket.id);
});

socket.on("peer:nego:done", ({ to, ans }) => {

    io.to(to).emit("peer:nego:final", { from: socket.id, ans });   //  to jatin
    const user = socketToUser.get(socket.id)
    console.log("5",user,socket.id);
});

socket.on("callRejected",({to})=>{
  io.to(to).emit("RejectedCall")
})






    //sending messages
    socket.on("newMessage",(message)=>{
       io.to(message.conversationId).emit('Message', message);
    })
    //sending messages

  });


  server.listen(process.env.PORT || 6010 , () => console.log(`Server has started.`));


