const express = require('express');

//Creating an object of express for using it in the code
const app = express();

// const cors = require('cors')
// app.use(cors())
//Initializing the http server for running the application on localhost

const server = require('http').Server(app);
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');

const peerServer = ExpressPeerServer(server, {
	//Creating a peer server and providing our express server as a parameter
	debug: true,
});
//Requiring UUID library for generating random and unique ID
const { v4: uuidV4 } = require('uuid');

app.use('/peerjs', peerServer);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
	res.redirect(`/${uuidV4()}`);
});

app.get('/:room', (req, res) => {
	//Declaring room as a parameter
	res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
	//Initializing the socket connection
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId);
		//Broadcasting a message as the user joined
		socket.to(roomId).broadcast.emit('user-connected', userId);

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message);
		});

		socket.on('disconnect', () => {
			//Listening if any user disconnected
			socket.to(roomId).broadcast.emit('user-disconnected', userId);
		});
	});
});
//Listening on Port 3030
server.listen(process.env.PORT || 3030);
