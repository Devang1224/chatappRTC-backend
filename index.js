const express = require("express");
const mongoose = require("mongoose")
const userRoute = require("./routes/user")
const conversationRoute = require("./routes/conversation")
const cors = require('cors')
const app = express();
const connectDB = require('./Db/db');


app.use(cors())
require('dotenv').config()
connectDB(); //establishing mongodb connection

app.use(express.json());


app.use("/user",userRoute);
app.use("/chat",conversationRoute)

 const server = app.listen(process.env.PORT,()=>{console.log("server is started")})

const io = require("socket.io")(server,{
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3001",
      }
})

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