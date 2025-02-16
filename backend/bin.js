const { server } = require('./index');

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server running on ws://localhost:${PORT}`);
});
