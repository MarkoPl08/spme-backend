const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const registrationRoute = require('../../routes/auth/register');
const { validateEmail } = require('../../utils/validation');

jest.mock('../../models/User');
jest.mock('bcryptjs');
jest.mock('../../utils/validation');

jest.mock('sequelize', () => {
    const SequelizeMock = require('sequelize-mock');
    const dbMock = new SequelizeMock();

    const DataTypesMock = {
        INTEGER: 'INTEGER',
        STRING: 'STRING',
        CHAR: jest.fn((len) => `CHAR(${len})`),
    };

    return {
        Sequelize: jest.fn(() => dbMock),
        DataTypes: DataTypesMock,
        Op: {
            or: Symbol('or')
        },
        Model: SequelizeMock.Model
    };
});

const app = express();
app.use(express.json());
app.use('/', registrationRoute);

describe('POST /register', () => {
    const validUserData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'Password123',
        packageId: 1,
        userId: 1
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if any required field is missing', async () => {
        const response = await request(app)
            .post('/register')
            .send({ username: 'testuser' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('All fields are required');
    });

    it('should return 400 if email format is invalid', async () => {
        validateEmail.mockReturnValue(false);

        const response = await request(app)
            .post('/register')
            .send({ ...validUserData, email: 'invalid-email' });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Invalid email format');
        expect(validateEmail).toHaveBeenCalledWith('invalid-email');
    });
});
