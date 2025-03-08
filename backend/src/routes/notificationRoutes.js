const express = require('express');
const { getNotifications } = require('../controllers/notificationController');
const {authenticate} = require('../middlewares/authMiddleWare');

const router = express.Router();

router.post('/notifications', authenticate, getNotifications);

module.exports = router;