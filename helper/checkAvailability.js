const isAvailable = (availability) => {
    if (!availability || !Array.isArray(availability)) {
        return false;
    }

    // utc hour
    const now = new Date();
    const currentHour = now.getUTCHours(); // Use UTC hours

    // time slots
    return availability.some((slot) => {
        const [startHour, endHour] = slot.split('-').map(Number);
        return currentHour >= startHour && currentHour < endHour;
    });
};

module.exports = isAvailable;
