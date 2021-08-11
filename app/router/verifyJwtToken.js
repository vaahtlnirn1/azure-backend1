const jwt = require('jsonwebtoken');
const config = require('../config/config.js');
const db = require('../config/db.config.js');
const Role = db.role;
const User = db.user;

verifyToken = (req, res, next) => {
	let token = req.headers['x-access-token'];
	if (!token) {
		return res.status(403).send({
			auth: false, message: 'No token has been found!'
		});
	}

	jwt.verify(token, config.secret, (err, decoded) => {
		if (err) {
			return res.status(500).send({
				auth: false,
				message: 'Authentication failed: ' + err
			});
		}
		req.userId = decoded.id;
		next();
	});
}

checkIfAdmin = (req, res, next) => {
	console.log(req.userId);
	User.findByPk(req.userId)
		.then(user => {
			console.log(req.userId);
			user.getRoles().then(roles => {
				for (let i = 0; i < roles.length; i++) {
					console.log(roles[i].name);
					if (roles[i].name.toUpperCase() === "ADMIN") {

						console.log(roles[i].name);
						next();
						return;
					}
				}


				res.status(403).send("This action requires an administrator.");
			})
			return;
		})
}

checkIfModOrAdmin = (req, res, next) => {
	User.findByPk(req.userId)
		.then(user => {
			user.getRoles().then(roles => {
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name.toUpperCase() === "PM") {
						next();
						return;
					}

					if (roles[i].name.toUpperCase() === "ADMIN") {
						next();
						return;
					}
				}

				res.status(403).send({
					auth: false,
					"message": "This action requires either an administrator or a post moderator."
				});
			})
		})
}

const authJwt = {};
authJwt.verifyToken = verifyToken;
authJwt.checkIfAdmin = checkIfAdmin;
authJwt.checkIfModOrAdmin = checkIfModOrAdmin;

module.exports = authJwt;
