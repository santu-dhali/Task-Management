const express = require("express");
const { createProject, updateProjectTeam, getProjectDetails, getAllProjects, getProjectSummary } = require("../controllers/projectController");
const { authenticate, authorize } = require("../middlewares/authMiddleWare");

const router = express.Router();

router.post("/createproject", authenticate, authorize(["Admin", "Manager", "Member"]), createProject);
router.put("/updateteam", authenticate, authorize(["Admin", "Manager", "Member"]), updateProjectTeam);
router.get("/projectdetails/getprojects", authenticate, getAllProjects);
router.get("/projectdetails/:id", authenticate, getProjectDetails);
router.get('/projectsummary/:id', getProjectSummary);

module.exports = router;