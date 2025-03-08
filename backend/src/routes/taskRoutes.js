const express = require("express");
const { createTask, getTasks, updateTaskStatus, addComment, getTaskById } = require("../controllers/taskController");
const { authenticate, authorize } = require("../middlewares/authMiddleWare");
// const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/createtask", authenticate, createTask);
router.get("/gettasks/:id", authenticate, getTasks);
router.get("/task/:id", authenticate, getTaskById);
router.put("/status", authenticate, updateTaskStatus);
router.post("/comment", authenticate, addComment);
// router.post("/attachment", authenticate, upload.single("file"), uploadAttachment);

module.exports = router;