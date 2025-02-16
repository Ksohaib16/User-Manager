const Profile = require('../backend/models/profile');
const { connectedUsers } = require('../backend/ws/websocket');
const isAvailable = require('../backend/helper/checkAvailability');
const notificationQueue = require('../backend/redis/redisClient');
console.log('worker is running');

// notificationQueue.on('ready', () => {
//     console.log('Queue connected to Redis');
// });

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
