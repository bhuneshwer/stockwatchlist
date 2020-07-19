(function () {

    /*
    Expected Parameters:
        -rqst.query.sessionId - optional - number - limiting the numbers of the data
    */

    function execute(rqst, q, utils) {
        let loggedInUser = rqst.req.user;
        if (loggedInUser && loggedInUser.stockIds && loggedInUser.stockIds.length) {
            let queryParams = {
                "_id": {
                    $in: loggedInUser.stockIds.map(stockId => new require('mongodb').ObjectID.createFromHexString(stockId.toString()))
                }
            };
            let options = {
                "page_number": !isNaN(rqst.query.page_number) ? rqst.query.page_number : 1,
                "limit": !isNaN(rqst.query.limit) ? parseInt(rqst.query.limit) : 100
            }

            utils.db.Stocks.getStocks(queryParams, {}, options, utils, (err, stocks) => {
                !stocks && (stocks = []);
                utils.resolveResponse(q, 0, 200, {
                    "stocks": stocks
                }, "Success");
            });
        } else {
            utils.resolveResponse(q, 0, 200, {
                "stocks": []
            }, "Success");
        }

    }

    exports.execute = execute;
})()