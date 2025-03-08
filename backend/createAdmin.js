const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
require('dotenv').config();

exports.createAdminUser = async () => {
    try {
        const existingAdmin = await User.findOne({ role: 'Admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD , salt);

        const adminUser = new User({
            username: process.env.ADMIN_USERNAME,
            email: process.env.ADMIN_EMAIL,
            password: hashedPassword,
            role: 'Admin',
        });

        await adminUser.save();
        console.log('Admin user created successfully');
    } catch (err) {
        console.error('Failed to create Admin user:', err);
    }
};