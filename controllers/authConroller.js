const { authSchema } = require('../validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

module.exports.signup = async (req, res) => {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const payload = {
        email: value.email,
        password: value.password,
    };

    const existingUser = await User.findOne({
        email: payload.email,
    });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const saltRound = 5;
        const hashedPassword = await bcrypt.hash(payload.password, saltRound);

        const user = await User.create({
            email: payload.email,
            password: hashedPassword,
        });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        const userData = user.toObject();
        delete userData.password;

        res.status(200).json({ message: 'User created successfully', user: userData, token });
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal server error' });
    }
};

module.exports.signupAdmin = async (req, res) => {
    if (req.headers['admin'] !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: 'You are not authorized' });
    }

    const { error, value } = authSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    const payload = {
        email: value.email,
        password: value.password,
    };

    const existingUser = await User.findOne({
        email: payload.email,
    });

    if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
    }

    try {
        const saltRound = 5;
        const hashedPassword = await bcrypt.hash(payload.password, saltRound);

        const user = new User({
            email: payload.email,
            password: hashedPassword,
            role: 'admin',
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({ message: 'User created successfully', user: userData, token });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.login = async (req, res) => {
    const { error, value } = authSchema.validate(req.body);
    if (error) {
        console.log('validation failed');
        return res.status(400).json({ message: error.details[0].message });
    }
    const payload = {
        email: value.email,
        password: value.password,
    };

    try {
        const user = await User.findOne({ email: payload.email });
        if (!user) {
            return res.status(401).json({ message: 'email or password is incorrect' });
        }

        const isMatch = await bcrypt.compare(payload.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'email or password is incorrect' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const userData = user.toObject();
        delete userData.password;

        res.json({
            message: 'Login successful',
            token,
            user: userData,
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error });
    }
};
