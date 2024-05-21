import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import connectDB from './Database.js';
import { Userdetails } from "./Utils.js";
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


const start =async()=>{
    try{
await connectDB()

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
global.nearUsers = new Map();
let activeUsers=[]
let near_users = [];

const calculateDistance = (coord1, coord2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
  const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.latitude * (Math.PI / 180)) *
      Math.cos(coord2.latitude * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Distance in km
};

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
    if(!activeUsers.some((user)=>user.userId===userId)){

      activeUsers.push({userId:userId,socketId:socket.id})
    }
    io.emit("get-users",activeUsers)
  });


 //near user function get 
  socket.on("userLocation", async(location) => {
    let cc = await Userdetails(location.user_id,socket.id,location);
  let Modified_data; 
  if(location?.user_id){
    Modified_data=cc[location?.user_id]
  }
 
    nearUsers.set(location, socket.id);
    if(typeof Modified_data === "object"){
    if(!near_users.some((user)=>user.user_id===Modified_data.user_id)){
      
      near_users.unshift(Modified_data)
      }

  }
  // console.log(near_users);

    // Calculate distance between current user and other users
    const nearUsersdata = near_users.filter((user) => {
if(Object.keys(location).length !== 0){
      const distance = calculateDistance(user.location, location);
      return distance <2; 
}
    });

// console.log(nearUsersdata);
    // Emit near users back to the client
    io.emit("nearUsers", nearUsersdata);
  });


        
   //notification
   socket.on("send-notification", (data) => {
    console.log(data);
    if(data.profile){
      io.emit("recive-notification",data); 
    }
      })
 //notification end

    
socket.on("disconnect",()=>{
  activeUsers=activeUsers.filter((user)=>user.socketId !==socket.id)
  io.emit("get-users",activeUsers)
  near_users=near_users.filter((user)=>user.socketId !==socket.id)
  io.emit("nearUsers", near_users);
})

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.messagetext,data.messageid);
    }
  });
});
