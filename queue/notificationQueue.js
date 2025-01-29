const Queue = require('bull');
const Notification = require('../models/notification');
const User = require('../models/user');
const Profile = require('../models/profile');
const { connectedUsers } = require('../ws/websocket');
const { isAvailable } = require('../helper/checkAvailability');

const notificationQueue = new Queue(
    'notifications',
    process.env.Redis_URL || {
        redis: {
            host: 'localhost',
            port: 6379,
        },
    },
);

notificationQueue.on('ready', () => {
    console.log('Queue connected to Redis');
});

notificationQueue.on('error', (error) => {});

notificationQueue.process(async (job) => {
    const { notificationId, recipients } = job.data;

    try {
        const notification = await Notification.findById(notificationId);
        const usersProfiles = await Profile.find({ _id: { $in: recipients } });

        usersProfiles.forEach((profile) => {
            if (isAvailable(profile.availability)) {
                const ws = connectedUsers.get(profile.userId.toString());
                if (ws) {
                    ws.send(
                        JSON.stringify({
                            type: 'NOTIFICATION',
                            data: notification,
                        }),
                    );
                    notification.deliveredAt = new Date();
                }
            }
        });

        notification.status = 'delivered';
        await notification.save();
    } catch (error) {
        console.error('Queue processing error:', error);
        throw error;
    }
});

module.exports = notificationQueue;
