const isAvailable = ({ startTime, endTime }) => {
    if (!startTime || !endTime) {
        return false;
    }
    const date = new Date();
    const utcHours = date.getUTCHours();
    const utcMinutes = date.getUTCMinutes();
    const currentTime = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(
        2,
        '0',
    )}`;

    return currentTime >= startTime && currentTime <= endTime;
};

module.exports = isAvailable;
