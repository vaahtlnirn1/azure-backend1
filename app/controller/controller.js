const db = require('../config/db.config.js');
const config = require('../config/config.js');
const User = db.user;
const Role = db.role;
const Device = db.device;

const Op = db.Sequelize.Op;

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');

exports.signup = (req, res) => {
// User registration to database
	User.create({
		name: req.body.name,
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 10)
	}).then(user => {
		Role.findAll({
			where: {
				name:  req.body.roles

			}
		}).then(roles => {
			var token = jwt.sign({ id: user.id }, config.secret, {
				expiresIn: 86400 // expires in 24 hours
			});
			user.setRoles(roles).then(() => {
				res.send({ auth: true, accessToken: token });
			});
		}).catch(err => {
			console.log("object");
			res.status(500).send("Error -> " + err);
		});
	}).catch(err => {
		res.status(500).send("Error: " + err);
	})
}

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

		res.status(200).send({auth: true, accessToken: token, id: user.id, name: user.name, username: user.username, email: user.email})

	}).catch(err => {
		res.status(500).send('Error: ' + err);
		console.log(err);
	});
}

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



// Device creation
exports.deviceAdd = (req, res) => {
	if (!req.body.title) {
		res.status(400).send({
			message: "Content can not be empty!"
		});
		return;
	}
	const device = {
		title: req.body.title,
		detail: req.body.detail,
		published: req.body.published ? req.body.published : false
	};
	// Device saves to the database
	Device.create(device)
		.then(data => {
			console.log(data);
			res.send(data);
		})
		.catch(err => {
			res.status(500).send({
				message:
					err.message || "An error has occurred while creating the device."
			});
		});
}

exports.deviceList = (req, res) => {
	Device.findAll()
		.then(device =>
			res.json(device)
		)
}


// View a device
exports.deviceView = function (req, res) {
	Device.findOne({
		where: { id: req.params.id }
	}).then(device =>
		res.json(device)
	)
}


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
				res.send({
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


exports.mainDashboard = (req, res) => {
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
