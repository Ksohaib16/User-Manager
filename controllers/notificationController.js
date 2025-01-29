const Notification = require('../models/notification');
const User = require('../models/user');
const isAvailable = require('../helper/checkAvailability');
const { notificationSchema } = require('../validator');
const { connectedUsers } = require('../ws/websocket');
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
        const receivers = await User.find({
            _id: { $in: value.recipients },
        }).lean();

        if (!receivers.length) {
            await Notification.findByIdAndDelete(notification._id);
            return res.status(400).json({ message: 'No valid recipients found' });
        }

        let finalStatus = 'delivered';

        if (sender.role === 'admin' && value.isCritical) {
            const sendPromises = receivers.map((receiver) => {
                const ws = connectedUsers.get(receiver._id.toString());
                return ws?.send(
                    JSON.stringify({
                        type: 'CRITICAL_NOTIFICATION',
                        data: notification.toJSON(),
                    }),
                );
            });

            await Promise.all(sendPromises);
            notification.deliveredAt = new Date();
        } else {
            // Regular notification processing
            const [availableReceivers, unavailableReceivers] = receivers.reduce(
                ([avail, unavail], receiver) => {
                    isAvailable(receiver.availability)
                        ? avail.push(receiver._id)
                        : unavail.push(receiver._id);
                    return [avail, unavail];
                },
                [[], []],
            );

            // Send to available users
            if (availableReceivers.length > 0) {
                const sendPromises = availableReceivers.map((receiverId) => {
                    const ws = connectedUsers.get(receiverId.toString());
                    return ws?.send(
                        JSON.stringify({
                            type: 'NOTIFICATION',
                            data: notification.toJSON(),
                        }),
                    );
                });

                await Promise.all(sendPromises);
                notification.deliveredAt = new Date();
            }

            // Queue for unavailable users
            if (unavailableReceivers.length > 0) {
                await queue.add({
                    notificationId: notification._id,
                    recipients: unavailableReceivers,
                });
                finalStatus = 'queued';
            }

            notification.status = finalStatus;
        }

        // Update notification status
        await notification.save();

        // Send immediate response
        return res.status(201).json({
            success: true,
            message:
                finalStatus === 'queued'
                    ? 'Notification partially delivered, queued for offline users'
                    : 'Notification delivered successfully',
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
