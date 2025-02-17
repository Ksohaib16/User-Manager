require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const authRoute = require('./routes/authRoute');
const profileRoute = require('./routes/profileRoute');
const notificationRoute = require('./routes/notificationRoute');
const { setupWebSocket } = require('./ws/websocket');
const connectDB = require('./config/db');
const http = require('http');
const server = http.createServer(app);
connectDB();
setupWebSocket(server);

app.use(express.json());
app.use(cors());

app.get('/test', (req, res) => res.send('This is test 1'));

app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/notification', notificationRoute);

module.exports = { app, server };
