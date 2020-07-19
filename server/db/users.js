(function () {
    function getUsers(queryParameters, selectedFields, options, utils, cb) {
        utils.getDbClient().then((client) => {
            var users = client.collection('users');
            if (selectedFields)
                selectedFields = {
                    "projection": selectedFields
                }
            users.find(queryParameters, selectedFields).toArray(function (err, users) {
                if (err) {
                    console.error('Error occurred while getting users details. Query parameters: ', queryParameters, " Error: ", err);
                    utils.endDbClient(client);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.endDbClient(client);
                    if (users && users.length > 0) {
                        utils.execute(cb, [null, users]);
                    } else {
                        utils.execute(cb, [err, null]);
                    }
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function getById(_id, selectedFields, utils, cb) {
        if (selectedFields) {
            selectedFields = {
                "projection": selectedFields
            }
        } else {
            selectedFields = {}
        }
        utils.getDbClient().then((client) => {
            var users = client.collection('users');
            if (utils.isValidObjectId(_id)) {
                _id = new require('mongodb').ObjectID.createFromHexString(_id.toString())
            }
            users.findOne({
                _id: _id
            }, selectedFields, (err, user) => {
                console.warn(`User is ${JSON.stringify(user)}`);
                utils.endDbClient(client);
                if (err) {
                    console.error(`Error while getting user err is ${JSON.stringify(err)}`)
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, user]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting user err is ${JSON.stringify(err)}`)
        });
    }

    function getByEmail(email, utils, cb) {
        utils.getDbClient().then((client) => {
            var users = client.collection('users');
            users.findOne({
                email: email
            }, {

            }, (err, user) => {
                console.warn(`User is ${JSON.stringify(user)}`);
                utils.endDbClient(client);
                if (err) {
                    console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, user]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function createUser(user, utils, cb) {
        utils.getDbClient().then((client) => {
            let users = client.collection('users');
            users.insert(user, function (err, users) {
                if (err) {
                    console.error('Error while creating user', err);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, users]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function checkAndCreateUser(user, queryParam, utils, cb) {
        utils.getDbClient().then((client) => {
            let users = client.collection('users');
            users.findOneAndUpdate(queryParam, {
                    "$set": user
                }, {
                    upsert: true,
                    returnNewDocument: true
                },
                function (err, user) {
                    if (err) {
                        utils.execute(cb, [err, null]);
                    } else {
                        utils.execute(cb, [null, user]);
                    }
                });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function updateUser(queryParam, updateQuery, utils, cb) {
        utils.getDbClient().then((client) => {
            let users = client.collection('users');
            users.updateOne(queryParam, {
                    "$set": updateQuery
                },
                (err, user) => {
                    if (err) {
                        utils.execute(cb, [err, null]);
                    } else {
                        utils.execute(cb, [null, user]);
                    }
                });
        }, (err) => {
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
            utils.execute(cb, [err, null]);
        });
    }

    return exports.Users = {
        getById: getById,
        getByEmail: getByEmail,
        createUser: createUser,
        getUsers: getUsers,
        checkAndCreateUser: checkAndCreateUser,
        updateUser: updateUser,
    }
})();