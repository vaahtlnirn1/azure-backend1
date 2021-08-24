const db = require("../config/db.config.js");
const Device = db.devices;
var iothub = require('azure-iothub');
const {QueryTypes} = require("sequelize");
var connectionString = '';
var registry = iothub.Registry.fromConnectionString(connectionString);

exports.deviceList = (req, res) => {
/*    let query1 = registry.createQuery('SELECT * FROM devices');
    let onResults = function (err, results) {
        if (err) {
            console.error('Failed to fetch the results: ' + err.message);
        } else {
            results.forEach(async (twin) =>  {
                try {
                    await db.sequelize.query("IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devDescription = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devDescription) SELECT (?), (?)",
                        {
                            // IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
                            // UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?)
                            // IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) PRINT 'moi' ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
                            replacements: [twin.deviceId, twin.status, twin.deviceId, twin.deviceId, twin.status],
                            type: QueryTypes.INSERT
                        });
                    // The function above this line and the function below this line can be used to accomplish the same task, except that the bottom function can not currently update database with a query from IoT Hub (a kind of "sync").
                    /*		Device.create({
                                deviceId: twin.deviceId,
                                devDescription: twin.status,
                            }).then(device => {
                                console.log(device);
                            }) */
         /*       } catch (e) {
                    console.error(e);
                }
            });         */
            Device.findAll()
                .then(device =>
                    res.json(device))
/*            if (query1) {
                console.log("Success!");
            }
        }
    };
    query1.nextAsTwin(onResults); */
}

exports.deviceListSync = (req, res) => {
    let query1 = registry.createQuery('SELECT * FROM devices');
    let onResults = function (err, results) {
        if (err) {
            console.error('Failed to fetch the results: ' + err.message);
        } else {
            results.forEach(async (twin) =>  {
                try {
                    await db.sequelize.query("IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devDescription = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devDescription) SELECT (?), (?)",
                        {
                            // IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
                            // UPDATE devices SET devStatus = (?), connState = (?), version = (?) WHERE deviceId = (?)
                            // IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) PRINT 'moi' ELSE INSERT INTO devices (deviceId, devStatus, connState, version) SELECT (?), (?), (?), (?)
                            replacements: [twin.deviceId, twin.status, twin.deviceId, twin.deviceId, twin.status],
                            type: QueryTypes.INSERT
                        });
                } catch (e) {
                    console.error(e);
                }
            });
            Device.findAll()
                .then(device =>
                    res.json(device))
            if (query1) {
                console.log("Success!");
            }
        }
    };
    query1.nextAsTwin(onResults);
}

// View a device
exports.deviceView = (req, res, err) => {
    const id = req.params.id;

    Device.findByPk(id)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error retrieving device with id=" + id
            });
        });
};

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
                res.status(404).send({
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