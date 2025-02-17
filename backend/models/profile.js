const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    number: String,
    bio: String,
    availability: {
        startTime: String,
        endTime: String,
    },
});

module.exports = mongoose.model('Profile', profileSchema);
