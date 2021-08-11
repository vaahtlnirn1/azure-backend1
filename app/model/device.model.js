module.exports = (sequelize, Sequelize) => {
	const Device = sequelize.define('devices', {
		deviceId: {
			type: Sequelize.STRING,
			required: true
		},
		devStatus: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: true
		},
	});
	return Device;
}
