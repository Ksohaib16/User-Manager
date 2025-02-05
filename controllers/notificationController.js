const Notification = require('../models/notification');
const User = require('../models/user');
const Profile = require('../models/profile');
const { notificationSchema } = require('../validator');
const { connectedUsers } = require('../ws/websocket');
const isAvailable = require('../helper/checkAvailability');
const queue = require('../queue/notificationQueue');

module.exports.sendNotification = async (req, res) => {
    console.log('Request received:', req.body);

    try {
        const { error, value } = notificationSchema.validate(req.body);
        if (error) {
            console.log('Validation error:', error);
            return res.status(400).json({ message: error.details[0].message });
        }

        const sender = await User.findById(req.userId);
        if (!sender) {
            return res.status(404).json({ message: 'Sender not found' });
        }

        const notification = new Notification({
            content: value.content,
            receivers: value.recipients,
            sender: req.userId,
            isCritical: value.isCritical,
            sentAt: new Date(),
        });
        await notification.save();
        // Find receivers
        const receivers = await Profile.find({
            userId: { $in: value.recipients },
        }).lean();
        console.log('receivers:', receivers.availability);

        // Send notification to all receivers
        if (sender.role === 'admin' && value.isCritical) {
            receivers.map((receiver) => {
                const ws = connectedUsers.get(receiver.userId.toString());
                if (ws) {
                    ws.send(
                        JSON.stringify({
                            type: 'CRITICAL_NOTIFICATION',
                            data: notification.toJSON(),
                        }),
                    );
                } else {
                    queue.add('check-connection', {
                        receiverId: receiver.userId,
                        notification: notification.toJSON(),
                    });
                }
                notification.status = 'delivered Instantly';
                notification.deliveredAt = new Date();
            });
            return res.status(201).json({
                success: true,
                message: 'Notification delivered to Online and Queued for Offline',
                data: notification,
            });
        } else {
            const availableReceivers = [];
            const unavailableReceivers = [];
            receivers.map((receiver) => {
                const startTime = receiver.availability.startTime;
                const endTime = receiver.availability.endTime;
                isAvailable({ startTime, endTime })
                    ? availableReceivers.push(receiver.userId)
                    : unavailableReceivers.push(receiver.userId);
            });

            // Send to available users
            if (availableReceivers.length > 0) {
                availableReceivers.map((receiverId) => {
                    const ws = connectedUsers.get(receiverId.toString());
                    if (ws) {
                        ws.send(
                            JSON.stringify({
                                type: 'NOTIFICATION',
                                data: notification.toJSON(),
                            }),
                        );
                    } else {
                        queue.add('check-connection', {
                            receiverId,
                            notification: notification.toJSON(),
                        });
                    }
                    notification.status = 'delivered';
                    notification.deliveredAt = new Date();
                });
                return res.status(201).json({
                    success: true,
                    message: 'Notification delivered to Availble Users',
                    data: notification,
                });
            }
            // Send to unavailable users
            if (unavailableReceivers.length > 0) {
                unavailableReceivers.map((receiverId) => {
                    queue.add('check-availability', {
                        receiverId,
                        notification: notification.toJSON(),
                    });
                });
                notification.status = 'queued';
                return res.status(201).json({
                    success: true,
                    message: 'Notification queued for unavailable users',
                    data: notification,
                });
            }
        }

        res.status(201).json({
            success: true,
            message: 'Notification delivered successfully',
            data: notification,
        });
    } catch (error) {
        console.error('Notification Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process notification',
            error: error.message,
        });
    }
};
