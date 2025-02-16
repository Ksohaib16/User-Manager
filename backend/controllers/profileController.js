const { profileSchema } = require('../validator');
const User = require('../models/user');
const Profile = require('../models/profile');

function convertLocalTimeToUTC(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    // Set the local time components
    date.setHours(hours);
    date.setMinutes(minutes);
    // Get UTC components
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    // Format to HH:MM
    return `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}`;
}

module.exports.updateProfile = async (req, res) => {
    const { error, value } = profileSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    const { startTime, endTime } = value.availability;

    const utcAvailability = {
        startTime: convertLocalTimeToUTC(startTime),
        endTime: convertLocalTimeToUTC(endTime),
    };

    console.log(utcAvailability);

    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await Profile.findOneAndUpdate(
            { userId: req.userId },
            {
                name: value.name,
                bio: value.bio,
                number: value.number,
                availability: utcAvailability,
            },
            { new: true, upsert: true },
        );

        return res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
