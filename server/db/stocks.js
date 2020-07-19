(function () {
    function getStocks(queryParameters, selectedFields, options, utils, cb) {
        utils.getDbClient().then((client) => {
            var stocks = client.collection('stocks');
            var cursor;
            // properties to be handled - limit, page_number 
            if (options && !(utils._.isEmpty(options)) && options.limit && options.page_number) {
                // options has limit and paging data
                // using skip and limit to enable paging
                cursor = stocks.find(queryParameters, selectedFields).skip(options.page_number > 0 ? ((options.page_number - 1) * options.limit) : 0).sort({
                    _id: -1
                });
                cursor.limit(options.limit);
            } else {
                // no options is available for paging
                cursor = stocks.find(queryParameters, selected_fields).sort({
                    _id: -1
                });
            }
            cursor.toArray((err, stocks) => {
                if (err) {
                    console.error('Error occurred while getting stocks details. Query parameters: ', queryParameters, " Error: ", err);
                    utils.endDbClient(client);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.endDbClient(client);
                    if (stocks && stocks.length > 0) {
                        utils.execute(cb, [null, stocks]);
                    } else {
                        utils.execute(cb, [err, null]);
                    }
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        })
    }

    function updateStock(queryParam, updateQuery, isMultiple, utils, cb) {
        utils.getDbClient().then((client) => {
            let Stocks = client.collection('stocks');
            Stocks.update(queryParam, updateQuery, {
                multi: isMultiple === true ? true : false
            }, (err, res) => {
                if (err) {
                    console.error('Error while updating stock', err);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, res]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function watchStock(utils,cb) {
        utils.getDbClient().then((client) => {
            let Stocks = client.collection('stocks');
            cb(Stocks.watch())
        }, (err) => {
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function deleteStock(queryParam, utils, cb) {
        utils.getDbClient().then((client) => {
            let Stocks = client.collection('stocks');
            Stocks.deleteOne(queryParam, (err, res) => {
                if (err) {
                    console.error('Error while deleting stock', err);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, res]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    function createStock(dataToInsrt, utils, cb) {
        utils.getDbClient().then((client) => {
            let Stocks = client.collection('stocks');
            Stocks.insertOne(dataToInsrt, (err, stock) => {
                if (err) {
                    console.error('Error while creating stock', err);
                    utils.execute(cb, [err, null]);
                } else {
                    utils.execute(cb, [null, stock]);
                }
            });
        }, (err) => {
            utils.execute(cb, [err, null]);
            console.error(`Error while getting db client err is ${JSON.stringify(err)}`)
        });
    }

    return exports.Stocks = {
        getStocks: getStocks,
        deleteStock: deleteStock,
        updateStock: updateStock,
        createStock: createStock,
        watchStock:watchStock
    }
})();