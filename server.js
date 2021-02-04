const express = require('express') //Requiring Express server
const app = express() //Creating an object of express for using it in the code
// const cors = require('cors')
// app.use(cors())
const server = require('http').Server(app) //Initializing the http server for running the application on localhost
const io = require('socket.io')(server)  //Requiring Socket.io and initializing it to {io}
const { ExpressPeerServer } = require('peer');  //Requiring Peer Server for Transaction of video stream 
const peerServer = ExpressPeerServer(server, {  //Creating a peer server and providing our express server as a parameter
  debug: true
});
const { v4: uuidV4 } = require('uuid') //Requiring UUID library for generating random and unique ID

app.use('/peerjs', peerServer); //Initializing the peer server and making our express server use it 

app.set('view engine', 'ejs') 
app.use(express.static('public')) //Stating the public folder containing Scripts to run on the platform

app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`)  //Redirecting the root directory to the unique ID created by UUID
})

app.get('/:room', (req, res) => { //Declaring room as a parameter
  res.render('room', { roomId: req.params.room }) //Storing RoomID from the request sent above
})

io.on('connection', socket => {   //Initializing the socket connection
  socket.on('join-room', (roomId, userId) => {  //Receiving the roomID and userID after someone Joined Room
    socket.join(roomId)  //User Joining the room as per roomID specified
    socket.to(roomId).broadcast.emit('user-connected', userId);   //Broadcasting a message as the user joined
    // messages
    socket.on('message', (message) => {   //Listening if somebody is sending any message 
      //send message to the same room
      io.to(roomId).emit('createMessage', message)    //If message Received, Emitting the message to all users
  }); 

    socket.on('disconnect', () => {   //Listening if any user disconnected
      socket.to(roomId).broadcast.emit('user-disconnected', userId)   //Emitting User-Disconnected if user disconnects
    })
  })
})

server.listen(process.env.PORT||3030)   //Listening on Port 3030 for our application to work on localhost
