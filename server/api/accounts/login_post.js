(function () {
    const bcrypt = require('bcrypt');

    /**
     * execute
     * @param {*} rqst 
     * @param {*} q 
     * @param {*} utils 
     * 
     * Required Params:
     * rqst.body.password - required  - Password
     * rqst.body.email - required - Email Id of the user
     */

    function execute(rqst, q, utils) {
        const {
            email,
            password
        } = rqst.body;

        const validationErrors = [];

        if (!email) validationErrors.push({
            msg: 'Please enter a valid email address.'
        });
        if (!password) validationErrors.push({
            msg: 'Password cannot be blank.'
        });

        if (validationErrors.length) {
            return utils.resolveResponse(q, 1, 200, {
                validationErrors: validationErrors
            }, "Required parameters not sent");
        } else {
            try {
                utils.db.Users.getByEmail(email.toLocaleLowerCase(), utils, (err, user) => {
                    if (err || !user || (user && !user.password)) {
                        return utils.resolveResponse(q, 1, 200, {}, "Incorrect username or password.")
                    } else {
                        var isPasswordCorrect = require("bcrypt").compareSync(password, user.password);
                        if (isPasswordCorrect) {
                            //  Deleting the redundant properties
                            delete user["password"]
                            delete user["emailVerificationToken"]
                            delete user["profile"]
                            rqst.req.logIn(user, (err) => {
                                console.warn(err || user);
                                return utils.resolveResponse(q, 0, 200, {}, "Success")
                            });
                        } else {
                            return utils.resolveResponse(q, 1, 200, {}, "Incorrect username or password.")
                        }
                    }

                });
            } catch (error) {
                console.error(error)
            }
        }
    }
    exports.execute = execute;
})()