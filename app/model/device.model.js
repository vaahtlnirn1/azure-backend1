module.exports = (sequelize, Sequelize) => {
	const Device = sequelize.define('devices', {
		title: {
			type: Sequelize.STRING,
			required: true
		},
		detail: {
			type: Sequelize.STRING
		},
	});
	return Device;
}
