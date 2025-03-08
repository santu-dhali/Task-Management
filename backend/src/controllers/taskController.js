const Task = require("../models/Task");
const Project = require("../models/Project");
const Comment = require("../models/Comment");

exports.createTask = async (req, res) => {
  const { title, description, dueDate, priority, projectId, status } = req.body;

  if(!title || !dueDate || !projectId) {
    return res.status(400).json({
        message: "All fields are required",
        success: false
    });
  }

  try {
    const existingTask = await Task.findOne({ title, project: projectId });
    if (existingTask) {
      return res.status(400).json({
          message: 'A task with this title already exists in the project',
          success: false,
      });
    }
    const task = await Task.create({title, description, dueDate, priority, project: projectId, reporter: req.user.id, status});

    await Project.findByIdAndUpdate(projectId, { $push: { tasks: task._id } });

    res.status(201).json({
        message: "Task created successfully",
        success: true,
        task
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to create task",
        success: false,
        err: err.message
    });
  }
};

exports.getTasks = async (req, res) => {
  const { id } = req.params;
  const isProject = await Project.findById(id);

  try {
    let tasks;
    if (isProject) {
      tasks = await Task.find({ project: id }).populate("assignee", "username email").populate("reporter", "username email").populate("comments").populate("project", "title");
    } else {
      tasks = await Task.find({ assignee: id }).populate("project", "title").populate("reporter", "username email").populate("comments").populate("project", "title").populate("comments.createdBy", "username email");
    }

    if(tasks.length === 0) {
      return res.status(404).json({
        message: "No tasks found",
        success: false
      });
    }

    res.status(200).json({
        message: "Tasks fetched successfully",
        success: true,
        tasks
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to fetch tasks",
        success: false
    });
  }
};

exports.getTaskById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const task = await Task.findById(id).populate("assignee", "username email").populate("reporter", "username email").populate( 
      {
        path: "comments",
        populate: {
          path: "createdBy",
          select: "username email"
        }
      }
    ).populate("project", "title").populate("comments.createdBy", "username email");

    if(!task) {
      return res.status(404).json({
        message: "No task found",
        success: false
      });
    }

    res.status(200).json({
        message: "Task fetched successfully",
        success: true,
        task
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to fetch task",
        success: false,
        err: err.message
    });
  }
};

exports.updateTaskStatus = async (req, res) => {
  const { taskId, status } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(taskId, { status }, { new: true });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
        success: false
      });
    }

    res.status(200).json({
        message: "Task status updated successfully",
        success: true,
        task
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to update task status",
        success: false,
        err: err.message
    });
  }
};

exports.addComment = async (req, res) => {
  const { taskId, text } = req.body;

  try {
    const comment = await Comment.create({ text, createdBy: req.user.id, task: taskId });

    await Task.findByIdAndUpdate(taskId, { $push: { comments: comment._id } });
    const populatedComment = await Comment.findById(comment._id).populate("createdBy", "username email");

    res.status(201).json({
        message: "Comment added successfully",
        success: true,
        comment : populatedComment
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to add comment",
        success: false,
        err: err.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        message: "Task not found",
        success: false,
      });
    }

    const { project, assignee } = task;

    await Project.findByIdAndUpdate(project, { $pull: { tasks: id } });
    if (assignee) {
      await User.findByIdAndUpdate(assignee, { $pull: { tasks: id } });
    }
    await Comment.deleteMany({ task: id });

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: "Task deleted successfully",
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to delete task",
      success: false,
      err: err.message,
    });
  }
};