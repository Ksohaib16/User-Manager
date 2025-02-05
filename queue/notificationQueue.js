const Queue = require('bull');
const Notification = require('../models/notification');
const User = require('../models/user');
const Profile = require('../models/profile');
const { connectedUsers } = require('../ws/websocket');
const isAvailable = require('../helper/checkAvailability');
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

notificationQueue.process('check-availability', async (job) => {
    try {
        const { receiverId, notification } = job.data;
        const receiverProfile = await Profile.findOne({ userId: receiverId });
        if (isAvailable(receiverProfile.availability)) {
            console.log('Receiver is available. Sending notification...');

            const ws = connectedUsers.get(receiverProfile.userId.toString());
            if (ws) {
                ws.send(JSON.stringify(notification));
                notification.status = 'delivered';
                notification.deliveredAt = new Date();
                console.log('Notification delivered successfully.');
            }
            console.log('Notification saved successfully.');
            return;
        }

        await notificationQueue.add(
            'check-availability',
            { receiverId, notification },
            {
                delay: 10000,
            },
        );
    } catch (error) {
        console.error('Error checking availability:', error);
    }
});

notificationQueue.process('check-connection', async (job) => {
    try {
        const { receiverId, notification } = job.data;
        console.log('checking connection');
        const ws = connectedUsers.get(receiverId.toString());
        if (ws) {
            ws.send(JSON.stringify(notification));
            notification.status = 'delivered';
            notification.deliveredAt = new Date();
            console.log('Notification delivered when receiver is connected successfully.');
            return;
        }
        await notificationQueue.add(
            'check-connection',
            { receiverId, notification },
            {
                delay: 10000,
            },
        );
        console.log('Receiver is not connected. Adding to queue for later delivery.');
        return;
    } catch (error) {
        console.log(error);
    }
});
module.exports = notificationQueue;
