// server.js
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const app = express();
const httpServer = require('http').createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
const PORT = process.env.SOCKET_PORT || 4000;

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
	const { message, id } = req.body;
	if (!message) {
		return res.status(400).json({ error: 'roomId and message are required' });
	}

	io.emit(id, message);
	return res.json({ success: true });
});


// Start the server
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
