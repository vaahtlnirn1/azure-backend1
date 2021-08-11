var express = require('express');
var bodyParser = require('body-parser');
const cors = require("cors");

var app = express();

var corsOptions = {
	origin: "http://localhost:8083"
};

app.use(cors(corsOptions));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const db = require('./app/config/db.config');

const Role = db.role;

db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });
// CODE ABOVE MAY BE NECESSARY FOR DATABASE TESTING

require("./app/router/router.js")(app);

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port)
})

function initial(){
    Role.create({
        id: 1,
        name: "USER"
    });

    Role.create({
        id: 2,
        name: "ADMIN"
    });

    Role.create({
        id: 3,
        name: "PM"
    });
}
