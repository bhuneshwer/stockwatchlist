(function () {

    var configure = (app, utils) => {
        try {
            const bcrypt = require('bcrypt');
            const passport = require('passport'),
                LocalStrategy = require('passport-local').Strategy;

            app.use(passport.initialize());
            app.use(passport.session());

            /**
             * Sign in using Email and Password.
             */

            passport.use(new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
            }, (email, password, done) => {
                console.warn("called local strategy", email, password);
                utils.db.Users.getByEmail(email.toLocaleLowerCase(), utils, (err, user) => {
                    if (err) {
                        return done(err);
                    }
                    if (!user) {
                        return done(null, false, {
                            msg: `Email ${email} not found.`
                        });
                    }
                    var isPasswordCorrect = bcrypt.compareSync(password, user.password);
                    if (isPasswordCorrect) {
                        return done(null, user);
                    } else {
                        return done(null, false, {
                            msg: 'Invalid email or password.'
                        });
                    }
                });
            }));


            passport.serializeUser((user, done) => {
                delete user['password'];
                done(null, user);
            });

            passport.deserializeUser(function (user, done) {
                delete user['password'];
                done(null, user);
            });

        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Login Required middleware.
     */
    exports.isAuthenticated = (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.send(401, 'UnAuthorised Access');
    };

    exports.configure = configure;
})()