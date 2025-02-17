const { describe, it, expect } = require('@jest/globals');
const request = require('supertest');
const { app } = require('../index');

jest.mock('../config/db', () => jest.fn().mockResolvedValue(undefined));

// Mock Redis client
jest.mock('../redis/redisClient', () => ({
    notificationQueue: {
        process: jest.fn(),
        on: jest.fn(),
        add: jest.fn(),
    },
}));

// Mock worker queue
jest.mock('../../worker/queue.js', () => ({
    notificationQueue: {
        process: jest.fn(),
        on: jest.fn(),
        add: jest.fn(),
    },
}));

describe('Trial test', () => {
    afterAll((done) => {
        if (app.server) {
            app.server.close(done);
        } else {
            done();
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return hello message from /test endpoint', async () => {
        const response = await request(app).get('/test').expect(200);

        expect(response.text).toBe('Hello from the backend test');
    });
});
