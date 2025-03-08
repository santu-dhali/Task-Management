const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');
const bcrypt = require('bcryptjs');

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, email } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully',
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update profile',
            success: false,
            error: err.message,
        });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Current password is incorrect',
                success: false,
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            message: 'Password changed successfully',
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to change password',
            success: false,
            error: err.message,
        });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;
        await Task.updateMany(
            { assignee: userId },
            { $set: { assignee: null } }
        );

        await Project.updateMany(
            { teamMembers: userId },
            { $pull: { teamMembers: userId } }
        );

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        res.status(200).json({
            message: 'Account deleted successfully',
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to delete account',
            success: false,
            error: err.message,
        });
    }
};