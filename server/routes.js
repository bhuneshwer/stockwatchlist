(function () {
        const errorCodes = {
            "MODULE_NOT_FOUND": {
                "status": 404
            }
        }

        const path = require('path')

        const fileOptions = {
            root: path.join(__dirname, '../client'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        }

        function establishRoutes(app) {

            app.use(require("express").static('client'))

            let utils = require('./utils/utils').Utils;
            app.use('/api/:moduleName/:apiName',require('./utils/permissions').Pemissions.isAuthenticated(utils), (req, res, next) => {
                next();
            }, function (req, res, next) {
                console.log('APi Called with Module: ' + req.params.moduleName + '/' + req.params.apiName);
                let apiObject = {
                    moduleName: req.params.moduleName,
                    apiName: req.params.apiName
                };
                //let ip_address = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress || req.socket.remoteAddress;
                handleApiCallWithModule(req.method, apiObject.moduleName, apiObject.apiName, req, res, next, utils);
            });

            app.use('/', function (req, res) {
                res.sendFile('login.html', fileOptions, function () {
                    res.end();
                });
            });
        }

        // method for handle the api call with module names
        function handleApiCallWithModule(apimethod, moduleName, apiName, req, res, next, utils) {
            let queryString = req.query;
            let params = req.params;
            let q = require('q').defer();
            let startTime = new Date();
            q.promise.then(function (result) {
                res.status = result.status;
                if (res.status === 201) {
                    res.send(result.data.message || result.data.error_message);
                } else if (res.status === 404) {
                    res.writeHead(404, {
                        "Content-Type": "text/plain"
                    });
                    res.end('Oops! \nThe requested URL /404 was not found on this server.');
                } else {
                    let response = {
                        code: 0,
                        data: result.data,
                        message: result.error_message
                    };
                    res.json(response);
                    res.end();
                    let endTime = new Date();
                    let elapsedTime = (endTime - startTime) / 1000;
                    console.warn("API Response", moduleName + "@" + apiName, elapsedTime);
                }
            }, function (err) {
                console.error('An unhandled error occured while calling the api. Error was ' + err.toString());
            }.bind(startTime));
            console.warn("[" + getFormatedDate() + "] [INFO] [API] [" + moduleName + "/" + apiName + '_' + apimethod.toLowerCase() + "] [execute] API Process Started.");
            let rqst = {
                query: queryString,
                params: params,
                cookies: req.cookies,
                req: req,
                res: res

            }
            if (apimethod) {
                apimethod = apimethod.toLowerCase()
                if (apimethod == "post" || apimethod == 'put') {
                    rqst.body = req.body;
                }
                try {
                    require('./api/' + moduleName + '/' + apiName + '_' + apimethod.toLowerCase()).execute(rqst, q, utils);
                } catch (err) {
                    handleRequestErr(moduleName, apiName, apimethod, res, err);
                }
            }
        }

        function handleRequestErr(moduleName, apiName, apimethod, res, err,q) {
            console.warn('Module name: ' + moduleName + ', Api Name:  ' + apiName + ', Method Name: ' + apimethod.toLowerCase() + ', Unhandled Error', err.code);
            try {
                q.resolve({
                    status: errorCodes[err.code]["status"]
                });
            } catch (e) {
                console.error('Error executing the API ' + moduleName + '_' + apiName, err);
                res.sendFile("404.html", fileOptions)
            }
        }

        //method for get the formated date for loging
        function getFormatedDate() {
            let currentDate = new Date();
            currentDate = currentDate.toJSON();
            return currentDate;
        }

        exports.establishRoutes = establishRoutes;
    } // end closure
)();