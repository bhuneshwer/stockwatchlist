(function () {
    const MongoClient = require('mongodb').MongoClient;
    const MongoUrl = getMongoUrl();

    var MongoConnection = null;


    function getMongoUrl() {
        return process.env.STOCk_DB_URL || "mongodb+srv://testuser:9XfaJ5mZhGTrKHRI@cluster0-cvdjl.mongodb.net/stocks-watchlist?retryWrites=true&w=majority&readPreference=secondary";
    }

    function getDbClient() {
        return new Promise((resolve, reject) => {
            if (MongoUrl) {
                MongoClient.connect(MongoUrl, {
                    "useNewUrlParser": true,
                    "useUnifiedTopology": true
                }, (err, client) => {
                    if (!err) {
                        MongoConnection = client;
                        resolve(MongoConnection.db());
                    } else {
                        reject(err);
                    }
                });
            }
        })
    }

    function endDbClient() {
        MongoConnection.close();
    }


    function execute(cb, params, on_obj) {
        if (cb) {
            setImmediate(function () {
                try {
                    cb.apply(on_obj, params);
                } catch (unhandled_error) {
                    console.error('Unhandled Error while setting Immediate', unhandled_error);
                }
            });
        }
    }

    function isValidObjectId(id) {
        if (id != null && typeof id === 'string' && typeof id != undefined) {
            return true;
        } else {
            return false;
        }
    }

    /**

     * @description returns the response to the callee
     *
     * All @params are required
     *
     * @param       {object}        q                 The promise object
     * @param       {number}        response_code     The response_code
     * @param       {number}        http_code         The http code
     * @param       {map object}    response_data_map The response map object
     * @param       {string}        message           The message
     * @return      {object}        response          The response object
     */
    function resolveResponse(q, response_code, http_code, response_data_map, message) {
        var response = {
            status: http_code,
            data: {}
        };
        if (response_data_map) {
            response.data = response_data_map;
        }
        if (response_code == 0) {
            response.data["message"] = message;
        } else {
            response.data["err_message"] = message;
        }
        response.data["code"] = response_code;
        q.resolve(response);
    }

    /**
     * @description returns true if given object contains the given keys otherwise return false
     *
     * All @params are required
     *
     * @param       {object}        obj               Complex object where we need to find the keys
     * @param       {string}        keys              Dot seperated string which contains key which need to find on given complex obj
     * @return      {object}        boolean           Boolean flag(true/false) to indicates if keys found or not
     */
    function hasProperty(obj, keys) {
        return keys.split(".").every(function (key) {
            if (typeof obj != "object" || obj === null || !(key in obj)) {
                return false;
            }
            obj = obj[key];
            return true;
        });
    }


    /**
     * @description Method to check if user is Logged In or not
     *
     * All @params are required
     *
     * @param       {object}        rqst            request object
     */
    function isUserLoggedIn(rqst) {
        // return (hasProperty(rqst, "req.user")) ? true : false;
        return true;
    }

    return exports.Utils = {
        execute: execute,
        ObjectID: require('mongodb').ObjectID,
        getDbClient: getDbClient,
        endDbClient: endDbClient,
        db: require('../db').db,
        isValidObjectId: isValidObjectId,
        isUserLoggedIn: isUserLoggedIn,
        resolveResponse: resolveResponse,
        _: require('underscore'),
        getMongoUrl: getMongoUrl
    };
})();