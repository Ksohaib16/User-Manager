require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const notificationRoute = require('./routes/notificationRoute');
const { setupWebSocket, connectedUsers } = require('./ws/websocket');
const connectDB = require('./config/db');
const http = require('http');
const server = http.createServer(app);

connectDB();
setupWebSocket(server);

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/notification', notificationRoute);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
    console.log('WebSocket server running on ws://localhost:3000');
});
