const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const Notification = require('../models/Notification');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        res.status(200).json({
            message: 'User details fetched successfully',
            success: true,
            user: user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Unable to fetch user details, please try again",
            success: false,
            error: err.message,
        });
    }
};

exports.getUserByEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }
        res.status(200).json({
            message: 'User details fetched successfully',
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Unable to fetch user by email',
            success: false,
            error: err.message,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({
            message: 'Users fetched successfully',
            success: true,
            users,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to fetch users',
            success: false,
            error: err.message,
        });
    }
};

exports.updateUserRole = async (req, res) => {
    const { userId, role } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: 'User not found',
                success: false,
            });
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            message: 'User role updated successfully',
            success: true,
            user,
        });
    } catch (err) {
        res.status(500).json({
            message: 'Failed to update user role',
            success: false,
            error: err.message,
        });
    }
};

exports.assignUserToProject = async (req, res) => {
    const { userId, projectId } = req.body;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                message: "Project not found",
                success: false,
            });
        }

        if (project.teamMembers.includes(userId)) {
            return res.status(400).json({
                message: "User is already in the project",
                success: false,
            });
        }

        user.projects.push(projectId);
        project.teamMembers.push(userId);

        await user.save();
        await project.save();

        res.status(200).json({
            message: "User assigned to project successfully",
            success: true,
            user: user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Unable to assign user to project, please try again",
            success: false,
            error: err.message,
        });
    }
};

exports.assignUserToTask = async (req, res) => {
    const { userId, taskId } = req.body;

    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
                success: false,
            });
        }

        if (task.assignee && task.assignee.toString() === userId) {
            return res.status(400).json({
                message: "User is already assigned to the task",
                success: false,
            });
        }

        user.tasks.push(taskId);
        task.assignee = userId;

        await user.save();
        await task.save();

        const notificationMessage = `You have been assigned a new task: ${task.title}`;
        await Notification.create({
            userId: userId,
            message: notificationMessage,
        });

        res.status(200).json({
            message: "User assigned to task successfully",
            success: true,
            user: user,
        });
    } catch (err) {
        res.status(500).json({
            message: "Unable to assign user to task, please try again",
            success: false,
            error: err.message,
        });
    }
};

exports.reassignUserToTask = async (req, res) => {
    const { newUserId, taskId } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({
                message: "Task not found",
                success: false,
            });
        }

        const newUser = await User.findById(newUserId).select("-password");
        if (!newUser) {
            return res.status(404).json({
                message: "New user not found",
                success: false,
            });
        }

        if (task.assignee && task.assignee.toString() === newUserId) {
            return res.status(400).json({
                message: "Task is already assigned to this user",
                success: false,
            });
        }
        if (task.assignee) {
            const oldAssignee = await User.findById(task.assignee);
            if (oldAssignee) {
                oldAssignee.tasks = oldAssignee.tasks.filter(
                    (t) => t.toString() !== taskId
                );
                await oldAssignee.save();
            }
            const oldAssigneeNotificationMessage = `You have been unassigned from the task: ${task.title}`;
            await Notification.create({
                userId: task.assignee,
                message: oldAssigneeNotificationMessage,
            });
        }

        newUser.tasks.push(taskId);
        task.assignee = newUserId;

        await newUser.save();
        await task.save();

        const newAssigneeNotificationMessage = `You have been assigned a new task: ${task.title}`;
        await Notification.create({
            userId: newUserId,
            message: newAssigneeNotificationMessage,
        });
        
        res.status(200).json({
            message: "Task reassigned successfully",
            success: true,
            newAssignee: newUser,
        });
    } catch (err) {
        res.status(500).json({
            message: "Unable to reassign task, please try again",
            success: false,
            error: err.message,
        });
    }
};
