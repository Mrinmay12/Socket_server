import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";

dotenv.config()
const app=express()
const PORT=process.env.PORT 
app.use(bodyParser.urlencoded({extended:true}))
// app.use(bodyParser.json())
app.use(bodyParser.json({ limit: '10mb' }))
app.use(cors())
app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });



  app.get("/",(req,res)=>{
    res.send("Welcome to Socket server")
})
// const start =async()=>{
//     try{
// await connectDB()
// app.listen(PORT,()=>{  
//     console.log("App start "+PORT)

// })

//     }catch(err){console.log(err)}
// }

const start =async()=>{
    try{
// await connectDB()

    }catch(err){console.log(err)}
}
start()
let socketport=app.listen(PORT,()=>{
  console.log("App start "+PORT)

})

const io = new Server(socketport, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
let activeUsers=[]

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    if(!activeUsers.some((user)=>user.userId===userId)){

      activeUsers.push({userId:userId,socketId:socket.id})
    }
    io.emit("get-users",activeUsers)
  });

socket.on("disconnect",()=>{
  activeUsers=activeUsers.filter((user)=>user.socketId !==socket.id)
  io.emit("get-users",activeUsers)
})

  socket.on("send-msg", (data) => {
    // console.log(data,"mybf");
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.messagetext,data.messageid);
    }
  });
});