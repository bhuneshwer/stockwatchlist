(function () {

    /*
    Expected Parameters:
        -rqst.query.sessionId - optional - number - limiting the numbers of the data
    */

    function execute(rqst, q, utils) {
        let queryParams = {};
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
    }

    exports.execute = execute;
})()