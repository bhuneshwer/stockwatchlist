(function () {

    const Utils = require('./utils').Utils;
    const operators = [1, -1]

    function getPercentageChange() {
        let randomIdx = Math.floor(Math.random() * 2);
        return Math.random() * operators[randomIdx]
    }

    function watchStock(socket) {
        Utils.db.Stocks.watchStock(Utils, (stockWatchStream) => {
            stockWatchStream.on("change", changeDetail => {
                try {
                    console.warn(changeDetail)
                    let updatedDocId = changeDetail.documentKey._id;
                    let updatedDoc = changeDetail.fullDocument;
                    let messageToEmit = {
                        "stockId": updatedDocId,
                        "updatedDetails": updatedDoc.bseDetails
                    }
                    //broadcast message to everyone except yourself.
                    socket.emit("Stock_Updated", messageToEmit);
                } catch (e) {
                    console.error(`Error while listening on Mongo Change Stream. error is ${e.toString()}`);
                }
            });
        })
    }

    function init(socket) {
        watchStock(socket);
        setInterval(() => {
            refreshStock();
        }, 1 * 60 * 1000)
    }

    function refreshStock(sessionId) {
        let queryParam = {}
        let updateQuery = [{
            "$set": {
                'bseDetails.valueUpdatedAt': new Date(),
                "bseDetails.lastValue": {
                    "$multiply": ["$bseDetails.currentValue", 1]
                },
                "bseDetails.currentValue": {
                    "$sum": ["$bseDetails.currentValue", getPercentageChange(true)]
                }
            }
        }]
        let isMultiple = true;

        Utils.db.Stocks.updateStock(queryParam, updateQuery, isMultiple, Utils, (err, res) => {});
    }

    return exports.Streamer = {
        init: init,
        watchStock: watchStock
    }
})();