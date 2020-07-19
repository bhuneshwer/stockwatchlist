(function () {
    /**
     * execute
     * @param {*} rqst 
     * @param {*} q 
     * @param {*} utils 
     * 
     */
    function execute(rqst, q, utils) {
        try {
            rqst.req.logout();
            rqst.req.session.destroy((err) => {
                if (err) console.log('Error : Failed to destroy the session during logout.', err);
                rqst.req.user = null;
                return utils.resolveResponse(q, 0, 200, {}, "Success");
            });
        } catch (error) {
            return utils.resolveResponse(q, 1, 200, {}, "Unhandled Err" + error.toString());
        }
    }
    exports.execute = execute;
})()