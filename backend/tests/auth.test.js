const { describe, it, expect } = require('@jest/globals');
const { authSchema } = require('../validator');
const { signup } = require('../controllers/authConroller');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const user = require('../models/user');

jest.mock('../models/user');
jest.mock('../validator');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('Auth signup test', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return a 200 status code and payload when valid data passed', async () => {
        authSchema.validate.mockReturnValue({
            value: {
                email: 'random@gmail.com',
                password: 'password',
            },
        });

        User.findOne.mockResolvedValue(null);
        bcrypt.hash.mockResolvedValue('hashedPassword');

        const mockUser = {
            _id: '123456',
            email: 'random@gmail.com',
            password: 'hashedPassword',
            role: 'user',
            toObject: () => ({
                _id: '123456',
                email: 'random@gmail.com',
                role: 'user',
            }),
        };
        User.create.mockResolvedValue(mockUser);

        jwt.sign.mockReturnValue('token');

        const req = {
            body: {
                email: 'random@gmail.com',
                password: 'password',
            },
        };

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        await signup(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            message: 'User created successfully',
            token: 'token',
            user: {
                _id: '123456',
                email: 'random@gmail.com',
                role: 'user',
            },
        });
    });
});
