const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Notifications fetched successfully',
            success: true,
            notifications,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: err.message,
        });
    }
};