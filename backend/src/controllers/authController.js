const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

exports.signUp = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if(!username || !email ||!password || !confirmPassword){
        return res.status(400).json({
            message: 'All fields are required',
            success: false
        })
    }

    try{
        const existingUser = await User.findOne({ email });
        if(existingUser){
            return res.status(400).json({
                message: 'User already exists. Please Sign in with other email',
                success: false
            })
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                message: 'Password does not match, try again',
                success: false
            })
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        let newUser = await User.create({username, email, password: hashedPassword});

        const payload = {
            email: newUser.email,
            id: newUser._id,
            role: newUser.role
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});

        newUser = newUser.toObject();
        newUser.password = undefined;
        newUser.token = token;

        return res.status(200).json({
            message: 'User created successfully',
            success: true,
            user: newUser
        })
    }catch(error){
        return res.status(500).json({
            message: 'Unable to create user, please try again',
            success: false,
            error: error.message
        })
    }
};

exports.login  = async (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: 'All fields are required',
            success: false
        })
    };

    try{
        let existingUser = await User.findOne({email});
        if(!existingUser){
            return res.status(404).json({
                message: 'Invalid credentials, please try again',
                success: false
            })
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if(!isPasswordCorrect){
            return res.status(400).json({
                message: 'Passwords do not match, please try again',
                success: false
            })
        }
        const payload = {
            email: existingUser.email,
            id: existingUser._id,
            role: existingUser.role
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'});

        existingUser = existingUser.toObject();
        existingUser.password = undefined;
        existingUser.token = token;

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        
        res.cookie('token', token, options).json({
            message: 'User logged in successfully',
            success: true,
            existingUser
        })
    }catch(error){
        return res.status(500).json({
            message: 'Unable to login, please try again',
            success: false,
            error: error.message
        })
    }
}