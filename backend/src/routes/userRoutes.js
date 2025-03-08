const express = require("express");
const { getUser, assignUserToProject, assignUserToTask, getUserByEmail, reassignUserToTask, getAllUsers, updateUserRole } = require("../controllers/userController");
const { authenticate, authorize } = require("../middlewares/authMiddleWare");

const router = express.Router();

router.get("/:id", authenticate, getUser);
router.post("/assignproject", authenticate, authorize(["Member"]), assignUserToProject);
router.post("/assigntask", authenticate, assignUserToTask);
router.put("/reassigntask", authenticate, reassignUserToTask);
router.post("/email", authenticate, getUserByEmail);
router.post("/users", authenticate, authorize(["Admin"]), getAllUsers);
router.put("/updaterole", authenticate, authorize(["Admin"]), updateUserRole);

module.exports = router;