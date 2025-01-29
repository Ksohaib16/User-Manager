const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
    content: {
        type: String,
        required: true,
    },
    receivers: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    isCritical: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['queued', 'delivered'],
        default: 'queued',
    },
    sentAt: {
        type: Date,
        default: Date.now,
    },
    deliveredAt: {
        type: Date,
    },
});

module.exports = mongoose.model('Notification', notificationSchema);
