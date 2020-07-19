(function () {
    var apisToIngore = ["register", "logout", "me", "login"]

    function isAuthenticated(utils) {
        return (req, res, next) => {
            if (apisToIngore.includes(req.params.apiName.toLowerCase())) {
                next()
            } else {
                let isUserLoggedIn = req.user && req.user._id;
                if (isUserLoggedIn) {
                    next()
                } else {
                    respondWithAccessError(res, "Unauthorized access.");
                }
            }

        }
    }

    function respondWithAccessError(res, errMsg) {
        res.status(401).send({
            error: errMsg || 'Unauthorized access.'
        });
    }

    return exports.Pemissions = {
        isAuthenticated: isAuthenticated
    }
})()