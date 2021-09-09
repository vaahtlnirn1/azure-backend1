const db = require("../config/db.config.js");
const Device = db.devices;
let iothub = require('azure-iothub');
const {QueryTypes} = require("sequelize");
let connectionString = '';
let registry = iothub.Registry.fromConnectionString(connectionString);

exports.deviceList = (req, res) => {
    Device.findAll()
        .then(device =>
            res.json(device))
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Could not retrieve devices."
            });
        });
};

exports.deviceListSync = (req, res) => {
    let query = registry.createQuery('SELECT * FROM devices');
    let onResults = function (err, results) {
        if (err) {
            console.error('Failed to fetch the results: ' + err.message);
        } else {
            results.forEach(async (twin) =>  {
                try {
                    await db.sequelize.query("IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, freeDescription) SELECT (?), (?), (?)",
                        {
                            // IF EXISTS(SELECT deviceID FROM devices WHERE deviceId = (?) ) UPDATE devices SET devStatus = (?) WHERE deviceId = (?) ELSE INSERT INTO devices (deviceId, devStatus, freeDescription) SELECT (?), (?), (?), (?)
                            replacements: [twin.deviceId, 1, twin.deviceId, twin.deviceId, 1, 'Write any extra notes here :)'],
                            type: QueryTypes.INSERT
                        });
                } catch (e) {
                    console.error(e);
                }
            });
            Device.findAll()
                .then(device =>
                    res.json(device))
            if (query) {
                console.log("Success!");
            }
        }
    };
    query.nextAsTwin(onResults);
};

// View a device
exports.deviceView = (req, res, err) => {
    const id = req.params.id;
    Device.findByPk(id)
        .then(data => {
                res.send(data);
})
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving the specified device."
            });
        });
};

exports.getTwin = (req, res) => {
    db.sequelize.query(`SELECT deviceId FROM devices WHERE id = ${req.params.id}`)
            .then(function(result) {
                    console.log(JSON.stringify(result));
                    let beginningSliceCharacterCount = 15;
                    let endingSliceCharacterCount = -6;
                    let properResult = JSON.stringify(result).slice(beginningSliceCharacterCount, endingSliceCharacterCount);
                    console.log(properResult);
                let query1 = registry.createQuery(`SELECT * FROM devices WHERE deviceId = '${properResult}'`);
                console.log(`SELECT * FROM devices WHERE deviceId = '${properResult}'`);
                let onResults = function (err, data) {
                    if (err) {
                        console.error('Failed to fetch the results: ' + err.message);
                    } else {
                        res.send(data);
                    }}
                query1.nextAsTwin(onResults);
            })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Could not retrieve result of query."
            });
})}

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
                message:
                    err.message || "Some error occurred while updating the specified device."
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
                message:
                    err.message || "Some error occurred while removing the specified device."
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