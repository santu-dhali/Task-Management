const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

exports.createProject = async (req, res) => {
  const { title } = req.body;

  if(!title){
    return res.status(400).json({
        message: "Project title is required",
        success: false
    })
  }

  try {
    const project = await Project.create({title, createdBy: req.user.id});

    project.teamMembers.push(req.user.id);
    await project.save();

    await User.findByIdAndUpdate(req.user.id, { $push: { projects: project._id } });

    res.status(201).json({
        message: "Project created successfully",
        success: true,
        project
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to create project",
        success: false,
        error: err.message
    });
  }
};

exports.updateProjectTeam = async (req, res) => {
  const { projectId, email, action } = req.body;

  try {
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    if (action === "add") {
        if (!project.teamMembers.includes(user._id)) {
          project.teamMembers.push(user._id);
        } else {
          return res.status(400).json({
              message: "User is already in the project.",
              success: false,
          });
        }
      
        if (!user.projects.includes(projectId)) {
          user.projects.push(projectId);
        } else {
          return res.status(400).json({
              message: "Project is already in the user's list.",
              success: false, 
           });
        }
      
        await project.save();
        await user.save();
      
        return res.status(200).json({
            message: "User added to the project successfully.",
            success: true,
            project
        });
      
      } else if (action === "remove") {
        if (project.teamMembers.includes(user._id)) {
          project.teamMembers = project.teamMembers.filter(
            (member) => member.toString() !== user._id.toString()
          );
        } else {
          return res.status(400).json({
              message: "User is not in the project.",
              success: false,
          });
        }
      
        if (user.projects.includes(projectId)) {
          user.projects = user.projects.filter(
            (project) => project.toString() !== projectId
          );
        } else {
          return res.status(400).json({
              message: "Project is not in the user's list.",
              success: false,
          });
        }
      
        await project.save();
        await user.save();
      
        return res.status(200).json({
            message: "User removed from the project successfully.",
            success: true,
            project
        });
      }
      
  } catch (err) {
    res.status(500).json({
        message: "Unable to update project team",
        success: false,
        error: err.message
    });
  }
};

exports.getProjectDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const project = await Project.findById(id)
      .populate("createdBy", "username email")
      .populate("teamMembers", "username email role")
      .populate("tasks", "title description status createdAt priority dueDate")
      .populate("tasks.assignee", "username email")


    if (!project) {
      return res.status(404).json({
        message: "Project not found",
        success: false
      });
    }

    res.status(200).json({
        message: "Project details",
        success: true,
        project
    });
  } catch (err) {
    res.status(500).json({
        message: "Unable to get project details",
        success: false,
        error: err.message
    });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ teamMembers: req.user.id })
      .populate("createdBy", "username email")
      .populate("teamMembers", "username email")
      .populate("createdAt", "createdAt");

    res.status(200).json({
      message: "All projects fetched successfully",
      success: true,
      projects
    });
  } catch (err) {
    res.status(500).json({
      message: "Unable to fetch projects",
      success: false,
      error: err.message
    });
  }
};

exports.getProjectSummary = async (req, res) => {
  const { id } = req.params;

  try {
      const project = await Project.findById(id).populate('tasks');
      if (!project) {
          return res.status(404).json({
              message: 'Project not found',
              success: false,
          });
      }

      const tasks = await Task.find({ project: id })
          .populate('assignee', 'username email').populate('reporter', 'username email')
          .select('title description status assignee createdAt dueDate priority');

      res.status(200).json({
          message: 'Project summary fetched successfully',
          success: true,
          project: {
              title: project.title,
              tasks,
          },
      });
  } catch (err) {
      res.status(500).json({
          message: 'Failed to fetch project summary',
          success: false,
          error: err.message,
      });
  }
};