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

require('dotenv').config()
connectDB(); //establishing mongodb connection

const server = http.createServer(app);
const io = socketio(server)(httpServer, {
    cors: {
      origin: "https://chatrtc.netlify.app",
      methods: ["GET", "POST"]
    }
  });;

app.use(express.json());


app.use("/user",userRoute);
app.use("/chat",conversationRoute)


io.on("connection", (socket) => {

    console.log("new user connected");

    socket.emit("connected","message from the server")
   
    socket.on("privateChat",(id)=>{
        socket.join(id);
        console.log((`user connected with convo id :${id}`));
    })
 
    socket.on("newMessage",(message)=>{
        socket.emit("Message",message);

    })

  });

  server.listen(process.env.PORT || 6010, () => console.log(`Server has started.`));