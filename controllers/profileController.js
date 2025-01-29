const { profileSchema } = require('../validator');
const User = require('../models/user');
const Profile = require('../models/profile');

module.exports.updateProfile = async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.message });
    }

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.userId },
            { $set: value },
            { new: true, upsert: true },
        );

        return res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
