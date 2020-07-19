(function () {
    /**
     * 
     * @param {*} rqst 
     * @param {*} q 
     * @param {*} utils 
     */
    function execute(rqst, q, utils) {
        if (rqst.req && rqst.req.user && rqst.req.user._id) {
            let queryParams = {
                "_id": new require('mongodb').ObjectID.createFromHexString(rqst.req.user._id.toString())
            }
            utils.db.Users.getUsers(queryParams, {
                "password": 0,
                "emailVerificationToken": 0,
                "passwordHistory": 0,
                "resetPasswordToken": 0,
            }, {}, utils, function (err, users) {
                if (users && users.length) {
                    return utils.resolveResponse(q, 0, 200, {
                        "user": users[0],
                        "isLoggedIn": true
                    }, "Success");
                } else {
                    return utils.resolveResponse(q, 0, 200, {
                        "user": null,
                        "isLoggedIn": true
                    }, "Success");
                }
            });
        } else {
            return utils.resolveResponse(q, 0, 200, {
                "user": null,
                "isLoggedIn": false
            }, "Success");
        }
    }
    exports.execute = execute;
})()