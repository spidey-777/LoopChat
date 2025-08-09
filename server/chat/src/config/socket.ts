import {Server,Socket} from 'socket.io'
import http from 'http'
import express from 'express'


const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:'*',
        methods:["GET","POST"]
    }
})

const userSocketMap: Record<string,string>={}

io.on("connection",(socket:Socket)=>{
    console.log('user connected', socket.id)


    socket.on("disconnect",()=>{
        console.log('user disconnected',socket.id);
    })

    socket.on('connect_error',(error)=>{
        console.log("socket connection error",error);
    })
})


export {app,server,io}