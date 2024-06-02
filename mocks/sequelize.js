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

module.exports = {
    Sequelize: jest.fn(() => dbMock),
    DataTypes: DataTypesMock,
    Op: {
        or: Symbol('or')
    },
    Model: ModelMock
};
