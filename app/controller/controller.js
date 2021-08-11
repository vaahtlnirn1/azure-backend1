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
				res.send({ auth: true, accessToken: token});
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
	// User registration to database
	Device.create({
		title: req.body.title,
		detail: req.body.detail,
	}).then(device => {
		res.send("Device has been successfully saved.");
	}).catch(err => {
		res.status(500).send("Error: " + err);
	})
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


// Update a note
exports.deviceUpdate = function (req, res) {
	Device.update(
		{
			detail: req.body.detail,
			title: req.body.title,

		},
		{
			where: { id: req.params.id }
		}
	).then(device =>
		res.json(device)
	).catch(err => {
		res.status(500).send("Error: " + err);
	})
}


// Delete a note
exports.deviceDelete = function (req, res) {
	Device.destroy({
		where: { id: req.params.id }
	}).then(device =>
		res.json("The device has been successfully deleted.")
	)
}


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
