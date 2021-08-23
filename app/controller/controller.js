const db = require('../config/db.config.js');
const config = require('../config/config.js');
const User = db.user;
const Role = db.role;
const Device = db.devices;
const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var iothub = require('azure-iothub');
const {QueryTypes} = require("sequelize");
var connectionString = '';
var registry = iothub.Registry.fromConnectionString(connectionString);

// CONTROLLER SECTIONS ORDER: AUTHENTICATION, PAGES, DEVICES


// AUTHENTICATION SECTION START

exports.signup = (req, res) => {
// User registration to database
	User.create({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10)
	}).then(user => {
		if (req.body.roles) {
		Role.findAll({
			where: {
				name: req.body.roles
			}
		}).then(roles => {
			user.setRoles(roles).then(() => {
				res.send({ message: "Role registered successfully!" });
			});
		});
	} else {
		user.setRoles([1]).then(() => {
			res.send({ message: "User registered successfully!" });
		});
	}
})
.catch(err => {
	res.status(500).send({ message: err.message });
});
};

exports.signin = (req, res) => {
	User.findOne({
		where: {
			email: req.body.email
		}
	}).then(user => {
		if (!user) {
			return res.status(400).send('The specified user does not match any registered user.');
		}

		var passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
		if (!passwordIsValid) {
			return res.status(401).send({ auth: false, accessToken: null, reason: "Your entered password is incorrect. Please try again." });
		}

		var token = jwt.sign({ id: user.id } , config.secret, {
			expiresIn: 86400 // expires in 24 hours
		});

		var authorities = [];
		user.getRoles().then(roles => {
			for (let i = 0; i < roles.length; i++) {
				authorities.push(roles[i].name.toUpperCase());
			}

		res.status(200).send({auth: true, accessToken: token, id: user.id, name: user.name, username: user.username, email: user.email, roles: authorities })
		});
	}).catch(err => {
		res.status(500).send('Error: ' + err);
		console.log(err);
	});
};

// AUTHENTICATION SECTION END


// PAGE SECTION START

exports.userPage = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			"description": "User Page",
			"user": user
		});
	}).catch(err => {
		res.status(500).send({
			"description": "You are not authorized to view this page.",
			"error": err
		});
	})
}

exports.adminPage = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			"description": "Admin Page",
			"user": user
		});
	}).catch(err => {
		res.status(500).send({
			"description": "You are not authorized to view this page.",
			"error": err
		});
	})
}

exports.moderatorPage = (req, res) => {
	User.findOne({
		where: { id: req.userId },
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).send({
			"description": "Moderator Page",
			"user": user
		});
	}).catch(err => {
		res.status(500).send({
			"description": "You are not authorized to view this page.",
			"error": err
		});
	})
}

exports.mainDashboard = (req, res) => {
	User.findOne({
		where: {id: req.userId},
		attributes: ['name', 'username', 'email'],
		include: [{
			model: Role,
			attributes: ['id', 'name'],
			through: {
				attributes: ['userId', 'roleId'],
			}
		}]
	}).then(user => {
		res.status(200).json({
			"description": "Dashboard",
			"user": user
		});
	}).catch(err => {
		res.status(500).json({
			"description": "You are not authorized to view this page.",
			"error": err
		});
	})
}

// PAGE SECTION END


// DEVICE SECTION START

exports.deviceList = (req, res, twin) => {
	let query1 = registry.createQuery('SELECT * FROM devices');
	let onResults = function (err, results) {
		if (err) {
			console.error('Failed to fetch the results: ' + err.message);
		} else {
			results.forEach(async (twin) =>  {
				try {
				await db.sequelize.query("IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)",
					{
					// IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
					// UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?)
					// IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) PRINT 'moi' ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
						replacements: [twin.deviceId, twin.status, twin.connectionState, twin.version, twin.deviceId, twin.deviceId, twin.status, twin.connectionState, twin.version],
						type: QueryTypes.INSERT
					});
				// The function above this line and the function below this line can be used to accomplish the same task, except that the bottom function can not currently update database with a query from IoT Hub (a kind of "sync").
			/*		Device.create({
						deviceId: twin.deviceId,
						devStatus: twin.status,
						connState: twin.connectionState,
						version: twin.version
					}).then(device => {
						console.log(device);
					}) */
				} catch (e) {
					console.error(e);
				}
			});
			let obj = results.map(x => x.deviceId);
			console.log(JSON.stringify(obj));
			res.send(obj);
			if (query1) {
				console.log("Success!");
			}
		}
	};
	query1.nextAsTwin(onResults);
}

// View a device
exports.deviceView = (req, res, err) => {
	const id = req.params.id;
	Device.findByPk(id)
		.then(data => {
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message: "Error retrieving device with id=" + id
			});
		});
};
/*	let query = db.sequelize.query("SELECT * FROM devices WHERE id = (?)",
		{
			replacements: [id],
			type: QueryTypes.SELECT
		});
	    console.log(query);
		if (err) {
			console.error('Failed to fetch the results: ' + err.message);
		} else {
			if (query) {
				// Do something with the results
				console.log(JSON.stringify(query.deviceId));
				res.send(query.deviceId);
			}
			if (query.hasMoreResults) {
				console.log('Next page...');
				query.nextAsTwin(onResults);
		}
	};
} */

// Update a device
exports.deviceUpdate = (req, res) => {
	const id = req.params.id;

	Device.update(req.body, {
		where: { id: id }
	})
		.then(num => {
			if (num == 1) {
				res.send({
					message: "Device was updated successfully."
				});
			} else {
				res.send({
					message: `Cannot update device with id=${id}. Maybe device was not found or req.body is empty!`
				});
			}
		})
		.catch(err => {
			res.status(500).send({
				message: "Error updating device with id=" + id
			});
		});
};


// Delete a device
exports.deviceDelete = (req, res) => {
	const id = req.params.id;

	Device.destroy({
		where: { id: id }
	})
		.then(num => {
			if (num == 1) {
				res.send({
					message: "Device was deleted successfully!"
				});
			} else {
				res.status(404).send({
					message: `Cannot delete device with id: ${id}.`
				});
			}
		})
		.catch(err => {
			res.status(500).send({
				message: "Could not delete device with id: " + id
			});
		});
};

exports.deviceDeleteAll = (req, res) => {
	Device.destroy({
		where: {},
		truncate: false
	})
		.then(nums => {
			res.send({ message: `${nums} devices were deleted successfully!` });
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while removing all devices."
			});
		});
};

// DEVICE SECTION END
