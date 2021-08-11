const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');
const express = require('express');
const router = express.Router();


module.exports = function (router) {

	const controller = require('../controller/controller.js');
	router.get("/", (req, res) => {
		res.json({ message: "Are you suggesting that coconuts migrate?" });

	});

	router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRoleExistence], controller.signup);

	router.post('/signin', controller.signin);

	router.get('/dashboard', [authJwt.verifyToken], controller.mainDashboard);

	router.get('/user', [authJwt.verifyToken], controller.userPage);

	router.get('/pm', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.moderatorPage);

	router.get('/admin', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.adminPage);

//	router.post('/devices', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.registry.create);
//	router.post('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceAdd);
	router.get('/devices', [authJwt.verifyToken], controller.deviceList);
	router.get('/device/:id', [authJwt.verifyToken], controller.deviceView);
	router.put('/device/:id', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.deviceUpdate);
	router.delete('/device/:id', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceDelete);
	router.delete('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceDeleteAll);

}
