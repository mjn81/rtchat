// server.js
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config({
	path: '.env',
});
const SOCKET_PORT = process.env.SOCKET_PORT;
const HTTP_PORT = process.env.HTTP_PORT;

console.log('env loaded socket port:', SOCKET_PORT, 'http port:', HTTP_PORT);

const app = express();
// Socket.io server listening
const httpServer = require('http').createServer(app).listen(SOCKET_PORT, () => {
	console.log(`Socket server running on port ${SOCKET_PORT}`);
});
const io = new Server(httpServer, {
  cors: {
    origin: '*',
	},
});

app.use(express.json());
app.use(cors());

let totalUsers = 0;
// Log when a user connects
io.on('connection', (socket) => {
	totalUsers++;
	console.log('User connected totalUsers: ', totalUsers);

	socket.on('disconnect', () => {
		totalUsers--;
		console.log('User disconnected totalUsers:', totalUsers);
	});
});

// Define the API route for pushing messages
app.post('/api/push', (req, res) => {
	if (process.env.SOCKET_SERVER_SECRET !== req.headers.authorization)
		return res.status(401).json({ error: 'Unauthorized' });
	const { data, id } = req.body;
	if (!data) {
		return res.status(400).json({ error: 'eventId and data are required' });
	}

	io.emit(id, data);
	return res.json({ success: true });
});

app.post('/api/pushGroup', (req, res) => {
	if (process.env.SOCKET_SERVER_SECRET !== req.headers.authorization)
		return res.status(401).json({ error: 'Unauthorized' });
	const { data, idArray } = req.body;
	if (!data) {
		return res.status(400).json({ error: 'eventId and data are required' });
	}
	// Check if data is an array
	if (!Array.isArray(data)) {
		for(let i = 0; i < idArray.length; i++) {
			io.emit(idArray[i], data);
		}
	} else {
		for(let i = 0; i < idArray.length; i++) {
			io.emit(idArray[i], data[i]);
		}
	}

	return res.json({ success: true });
});
// HTTP server listening
app.listen(HTTP_PORT, () => {
	console.log(`HTTP Server running on ${HTTP_PORT}`);
});
