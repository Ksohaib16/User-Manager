const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const connectedUsers = new Map();

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        const token = new URL(req.url, 'http://localhost').searchParams.get('token');
        if (!token) return ws.close();

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            connectedUsers.set(decoded.userId.toString(), ws);

            ws.on('close', () => {
                connectedUsers.delete(decoded.userId.toString());
            });
        } catch (error) {
            ws.close();
        }
    });

    return connectedUsers;
};

module.exports = { setupWebSocket, connectedUsers };
