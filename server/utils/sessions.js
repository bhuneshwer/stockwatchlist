(function () {

    var session = require('express-session');
    const Utils = require('./utils').Utils;

    function initSessionStore(app) {
        return new Promise((resolve, reject) => {
            getSessionStore().then((sessionStore) => {
                if (sessionStore) {
                    // We need to trust proxies. This is because the SSL may be terminated 
                    // But nginx / ELB knows we are sending via https. 
                    // If the below is not included, since the cookie is "secure = true"
                    // it will not go out
                    app.set("trust proxy", 1);
                    var cookieName = process.env.cookie_name;
                    if (!cookieName) {
                        cookieName = 'sth.dsflt.sid';
                    }
                    var cookieOptions = {
                        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
                        resave: true
                    }

                    app.use(session({
                        proxy: true,
                        store: sessionStore,
                        secret: 'CdfKo*9OsUxc$-$123',
                        cookie: cookieOptions,
                        name: cookieName,
                        rolling: true,
                        saveUninitialized: true
                    }));

                    resolve()
                }
            }, (err) => {
                reject(err);
            })
        })
    }
    function getSessionStore() {
        return new Promise((resolve, reject) => {
            var DbUrl = Utils.getMongoUrl();
            var MongoDBStore = require('connect-mongodb-session')(session);
            var sessionStore = new MongoDBStore({
                uri: DbUrl,
                collection: 'stockUsersSessions'
            });
            sessionStore.on('error', function (error) {
                console.error(`Error while setting session store ${error.toString()}`);
            });
            resolve(sessionStore);
        })
    }
    exports.initSessionStore = initSessionStore;
})()