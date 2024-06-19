require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../app');

jest.mock('sequelize', () => {
    const SequelizeMock = require('sequelize-mock');
    const dbMock = new SequelizeMock();

    const DataTypesMock = {
        STRING: jest.fn(() => 'STRING'),
        INTEGER: jest.fn(() => 'INTEGER'),
        CHAR: jest.fn((len) => `CHAR(${len})`),
        DECIMAL: jest.fn(() => 'DECIMAL'),
        BOOLEAN: jest.fn(() => 'BOOLEAN'),
    };

    class ModelMock extends SequelizeMock.Model {}
    ModelMock.hasMany = jest.fn();
    ModelMock.belongsTo = jest.fn();
    ModelMock.findByPk = jest.fn();

    return {
        Sequelize: jest.fn(() => dbMock),
        DataTypes: DataTypesMock,
        Op: {
            or: Symbol('or')
        },
        Model: ModelMock
    };
});

const User = require('../../models/User');
const SubscriptionPackages = require('../../models/SubscriptionPackages');

User.findByPk = jest.fn();
SubscriptionPackages.findByPk = jest.fn();

describe('API Endpoints', () => {
    let token;

    beforeAll(() => {
        const user = { UserID: 1, RoleID: 'admin' };
        token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Generated token:', token);
    });

    test('GET /api/photos/all returns 200', async () => {
        const response = await request(app)
            .get('/api/photos/all')
            .set('Authorization', `Bearer ${token}`);

        console.log('Response status:', response.status);
        console.log('Response body:', response.body);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('GET /api/subscriptions/packages returns 200', async () => {
        const response = await request(app)
            .get('/api/subscriptions/packages')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test('GET /api/subscriptions/consumption/:userId returns 200 for valid user', async () => {
        User.findByPk.mockResolvedValueOnce({
            id: 1,
            PackageID: 1,
            UploadCount: 10,
            StorageUsed: 500
        });
        SubscriptionPackages.findByPk.mockResolvedValueOnce({
            UploadLimit: 100,
            StorageLimit: 1000
        });

        const response = await request(app)
            .get('/api/subscriptions/consumption/1')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            uploadCount: 10,
            storageUsed: 500,
            uploadLimit: 100,
            storageLimit: 1000
        });
    });

    test('GET /api/subscriptions/consumption/:userId returns 404 for invalid user', async () => {
        User.findByPk.mockResolvedValueOnce(null);

        const response = await request(app)
            .get('/api/subscriptions/consumption/999')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'User not found' });
    });

    test('GET /api/subscriptions/consumption/:userId returns 404 for invalid subscription package', async () => {
        User.findByPk.mockResolvedValueOnce({
            id: 1,
            PackageID: 1,
            UploadCount: 10,
            StorageUsed: 500
        });
        SubscriptionPackages.findByPk.mockResolvedValueOnce(null);

        const response = await request(app)
            .get('/api/subscriptions/consumption/1')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Subscription package not found' });
    });
});
