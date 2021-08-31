const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');
const express = require('express');
const deviceController = require("../controller/deviceController.js");
const router = express.Router();


module.exports = function (router) {

	const controller = require('../controller/controller.js');
	const deviceController = require('../controller/deviceController.js');
	router.get("/", (req, res) => {
		res.json({ message: "Are you suggesting that coconuts migrate? Well, you should probably navigate to 'localhost:8083' to use the service which you probably are intending to use :) " });

	});

	router.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRoleExistence], controller.signup);
	router.post('/signin', controller.signin);

	router.get('/dashboard', [authJwt.verifyToken], controller.mainDashboard);
	router.get('/user', [authJwt.verifyToken], controller.userPage);
	router.get('/pm', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.moderatorPage);
	router.get('/admin', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.adminPage);

//	router.post('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceAdd);
	router.get('/devices', [authJwt.verifyToken], deviceController.deviceList);
	router.put('/devices', [authJwt.verifyToken], deviceController.deviceListSync);
	router.get('/device/:id', [authJwt.verifyToken], deviceController.deviceView);
	router.put('/device/:id', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], deviceController.deviceUpdate);
	router.delete('/device/:id', [authJwt.verifyToken, authJwt.checkIfAdmin], deviceController.deviceDelete);
	router.delete('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], deviceController.deviceDeleteAll);
}