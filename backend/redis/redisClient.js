const Queue = require('bull');
const notificationQueue = new Queue('notifications', {
    redis: {
        host: 'localhost',
        port: 6379,
    },
});

notificationQueue.on('ready', () => {
    console.log('Queue connected to Redis');
});

notificationQueue.on('error', (error) => {
    console.error('Error connecting to Redis:', error);
});
module.exports = notificationQueue;
