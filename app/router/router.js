const verifySignUp = require('./verifySignUp');
const authJwt = require('./verifyJwtToken');


module.exports = function (app) {

	const controller = require('../controller/controller.js');
	app.get("/", (req, res) => {
		res.json({ message: "Are you suggesting that coconuts migrate?" });

	});

	app.post('/signup', [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRoleExistence], controller.signup);

	app.post('/signin', controller.signin);

	app.get('/dashboard', [authJwt.verifyToken], controller.mainDashboard);

	app.get('/user', [authJwt.verifyToken], controller.userPage, controller.mainDashboard);

	app.get('/pm', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.moderatorPage, controller.mainDashboard);

	app.get('/admin', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.adminPage, controller.mainDashboard);

	app.post('/devices', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.deviceAdd);
	app.post('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceAdd);
	app.get('/devices', [authJwt.verifyToken], controller.deviceList);
	app.get('/device/:id', [authJwt.verifyToken], controller.deviceView);
	app.put('/device/:id', [authJwt.verifyToken, authJwt.checkIfModOrAdmin], controller.deviceUpdate);
	app.delete('/device/:id', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceDelete);
	app.delete('/devices', [authJwt.verifyToken, authJwt.checkIfAdmin], controller.deviceDeleteAll);

}
