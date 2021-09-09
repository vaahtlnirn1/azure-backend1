const db = require('../config/db.config.js');
const config = require('../config/config.js');
const ROLEs = config.ROLEs;
const User = db.user;

checkDuplicateUsernameOrEmail = (req, res, next) => {
	// Checks for existence of username
	User.findOne({
		where: {
			username: req.body.username
		}
	}).then(user => {
		if(user){
			console.log(req.body.username);
			res.status(400).send("Oops! This username is already in use. Please enter a different username.");
			return;
		}

		// Checks for existence of email
		User.findOne({
			where: {
				email: req.body.email
			}
		}).then(user => {
			if(user){
				res.status(400).send("Oops! This email is already in use. Please enter a different email.");
				return;
			}

			next();
		});
	});
}

checkRoleExistence = (req, res, next) => {
	for(let i=0; i<req.body.roles.length; i++){
		if(!ROLEs.includes(req.body.roles.toUpperCase())){
			res.status(400).send("Oops! Role does not exist. Please enter either 'admin', 'pm', or 'user'. " + req.body.roles);
			return;
		}
	}
	next();
}

const signUpVerify = {};
signUpVerify.checkDuplicateUsernameOrEmail = checkDuplicateUsernameOrEmail;
signUpVerify.checkRoleExistence = checkRoleExistence;

module.exports = signUpVerify;
