module.exports = (sequelize, Sequelize) => {
    const DeviceHist = sequelize.define('devicesHist', {
        deviceId: {
            type: Sequelize.STRING,
            required: true,
        },
        devStatus: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    });
    return DeviceHist;
}