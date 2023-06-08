const express = require("express");
const mongoose = require("mongoose")
const userRoute = require("./routes/user")
const conversationRoute = require("./routes/conversation")
const cors = require('cors')
const app = express();

app.use(cors())
require('dotenv').config()

app.use(express.json());


app.use("/user",userRoute);
app.use("/chat",conversationRoute)



mongoose.connect(process.env.MONGO_URL).then(()=>{
    
    app.listen(process.env.PORT,()=>{console.log("server is started")})
}).catch((err)=>{console.log(err)})