const express = require('express');
const { updateProfile, changePassword, deleteAccount} = require('../controllers/profileController');
const { authenticate } = require('../middlewares/authMiddleWare');
const { getUser } = require('../controllers/userController')

const router = express.Router();

router.get('/profile/:id', authenticate, getUser);
router.put('/updateprofile', authenticate, updateProfile);
router.put('/profile/changepassword', authenticate, changePassword);
router.delete('/deleteprofile', authenticate, deleteAccount);

module.exports = router;