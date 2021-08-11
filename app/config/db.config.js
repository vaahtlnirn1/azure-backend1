const Sequelize = require('sequelize');

const sequelize = new Sequelize('', '', '', { //database,username,password
host: "",
dialect: "mssql",
port: 1433,
dialectOptions: {
  instanceName: "SQLEXPRESS"
},
  },
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;


db.user = require('../model/user.model.js')(sequelize, Sequelize);
db.role = require('../model/role.model.js')(sequelize, Sequelize);
db.device = require('../model/device.model.js')(sequelize, Sequelize);


db.role.belongsToMany(db.user, { through: 'user_roles', foreignKey: 'roleId', otherKey: 'userId'});
db.user.belongsToMany(db.role, { through: 'user_roles', foreignKey: 'userId', otherKey: 'roleId'});

module.exports = db;
