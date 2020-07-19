(function () {
    const {
        promisify
    } = require('util');
    const crypto = require('crypto');
    let console = require('console');
    const bcrypt = require('bcrypt');

    /**
     * execute
     * @param {*} rqst 
     * @param {*} q 
     * @param {*} utils 
     * 
     * Required Params:
     * rqst.body.password - optional  - Password
     * rqst.body.email - required - Email Id of the user
     * rqst.body.name - optional - Name of the user
     */
    function execute(rqst, q, utils) {
        const {
            email,
            password,
            name
        } = rqst.body;

        const validationErrors = [];

        if (!email) validationErrors.push({
            msg: 'Please enter a valid email address.'
        });
        if (!password) validationErrors.push({
            msg: 'Please enter a password.'
        });
        if (!name) validationErrors.push({
            msg: 'Please enter a name.'
        });

        if (validationErrors.length) {
            return utils.resolveResponse(q, 1, 200, {
                validationErrors: validationErrors
            }, "Required parameters not sent");
        } else {
            rqst.body.email = rqst.body.email.toLocaleLowerCase();

            let user = {
                email: rqst.body.email,
                password: rqst.body.password || null,
                createdDate: new Date(),
                isEmailVerified: true,
                name: rqst.body.name
            }

            if (rqst.body.stockIds && rqst.body.stockIds.length > 0) {
                user.stockIds = rqst.body.stockIds.map(stockId => new require('mongodb').ObjectID.createFromHexString(stockId.toString()))
            }
            
            if (user.password && user.password.length) {
                user.password = bcrypt.hashSync(user.password, 10);
            }
            utils.db.Users.getUsers({
                "email": rqst.body.email
            }, {}, {}, utils, (err, users) => {
                if (users && users.length) {
                    return utils.resolveResponse(q, 1, 200, {}, `User already exist with given email ${rqst.body.email}.`);
                } else {
                    createRandomToken
                        .then((token) => {
                            let now = new Date();
                            user.emailVerificationToken = token;
                            // 7 days expiration for token
                            user.emailVerificationTokenExpiresAfter = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000))
                            return {
                                token: token,
                                email: user.email,
                                host: rqst.req.headers.host
                            };
                        }).then((tokenParams) => {
                            return new Promise((resolve, reject) => {
                                utils.db.Users.createUser(user, utils, (err, results) => {
                                    if (err) {
                                        reject(err);
                                    } else {
                                        console.warn(`New user created with response ${JSON.stringify(results)}`);
                                        resolve(tokenParams);
                                    }
                                })
                            });
                        })
                        .then(() => {
                            return utils.resolveResponse(q, 0, 200, {
                                "msg": `An e-mail has been sent to ${user.email} with further instructions.`
                            }, `An e-mail has been sent to ${user.email} with further instructions.`);
                        })
                        .catch((err) => {
                            return utils.resolveResponse(q, 1, 200, {}, err.toString());
                        });
                }
            });
        }
    }
    exports.execute = execute;
    const randomBytesAsync = promisify(crypto.randomBytes);
    const createRandomToken = randomBytesAsync(16)
        .then((buf) => buf.toString('hex'));

})()