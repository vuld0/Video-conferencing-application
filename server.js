//server for Node.js (https://serverjs.io/)

//Internal modules
const express = require('express');
const app = express();
const server = require('http').Server(app);
const { v4: uuidv4 } = require('uuid');
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

//Getting the Room IDs
app.get('/:rooom', (req, res) => {
	res.render('room', { roomId: req.params.room });
});

//TODO @Rahul : Add frontend related engine modules
//TODO @Machi : Add socket files

server.listen(3030);
