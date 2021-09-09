let express = require('express');
let bodyParser = require('body-parser');
const cors = require("cors");

let app = express();

let corsOptions = {
	origin: "http://localhost:8083"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const db = require('./app/config/db.config');

const Role = db.role;

db.sequelize.sync();
console.log("Current database syncing (no drop)!\n");
//db.sequelize.sync({ force: true }).then(() => {
//console.log("Dropping and re-creating database.");
//initial();
//});
// CODE ABOVE IS NECESSARY FOR DATABASE TESTING, ESPECIALLY IF DATABASE MIGRATION OCCURS BECAUSE THE "initial" FUNCTION ESTABLISHES ROLES AND CONSTRAINTS OF COLUMNS, WHICH ARE CRUCIAL

require("./app/router/router.js")(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.\n`);
});

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
/*    let queryInterface = db.sequelize.getQueryInterface();
    queryInterface.addConstraint('devices', {
        fields: ['devStatus'],
        type: 'check',
        where: {
            devStatus: ['enabled', 'disabled'],
        },
    });
/*    queryInterface.addConstraint('devices', {
        fields: ['connState'],
        type: 'check',
        where: {
            connState: ['Connected', 'Disconnected']
        },
    }); */
}
