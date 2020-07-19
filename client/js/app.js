(function () {
    function initApp() {
        new Vue({
            el: '#myStockApp',
            data() {
                return {
                    "isInProgress": true,
                    "stocksAvailable": false,
                    "userName": "Bhunesh",
                    "stocks": {},
                    "isLoggedIn": false,
                    "loginForm": {
                        "email": "",
                        "password": ""
                    },
                    "loggedInInfoFetched": false,
                    "loginInProgress": false
                }
            },
            mounted() {

                axios.get(`${SERVER_BASE_URL}/api/accounts/me`).then(response => {
                    this.loggedInInfoFetched = true;
                    document.getElementById("myStockPageContainer").style.display = "block";
                    document.getElementById("pageLoader").style.display = "none";
                    if (response && response.data && response.data.data.isLoggedIn == true) {
                        this.setLoggedIn();
                        this.getWatchList();
                    } else {
                        this.isLoggedIn = false;
                    }
                })
            },

            created() {
                this.Socket = io();
                this.Socket.on('Stock_Updated', (msg) => {
                    let stock = this.stocks[msg.stockId];
                    if (stock && msg && msg.stockId && this.stocks[msg.stockId]) {
                        this.updateStock(msg.stockId, msg.updatedDetails)
                    }
                })
            },
            methods: {
                updateStock(docId, updatedDetail) {
                    if (this.stocks && this.stocks[docId]) {
                        let updatedStocks = {};
                        for (var stockId in this.stocks) {
                            updatedStocks[stockId] = this.stocks[stockId];
                            if (docId == stockId) {
                                updatedStocks[stockId]["bseDetails"] = updatedDetail;
                            }
                        }
                        this.stocks = updatedStocks;

                    }
                },
                onLogin() {
                    let requestBody = {
                        "email": this.loginForm.email,
                        "password": this.loginForm.password
                    }
                    this.loginInProgress = true;
                    axios.post(`${SERVER_BASE_URL}/api/accounts/login`, requestBody).then(response => {
                        this.loginInProgress = false;
                        if (response && response.data && response.data.data) {
                            if (response.data.data.code == 1) {
                                alert(response.data.data.err_message);
                            } else {
                                document.getElementById("loginForm").reset();
                                this.setLoggedIn();
                                this.getWatchList();
                            }
                        } else {
                            alert("Something went wrong. Please try again")
                        }
                    })
                },
                logout() {
                    axios.get(`${SERVER_BASE_URL}/api/accounts/logout`).then(response => {
                        console.warn(response.data.data)
                        this.isLoggedIn = false;
                    })
                },
                getWatchList() {
                    axios
                        .get(`${SERVER_BASE_URL}/api/stocks/list`)
                        .then(response => {
                            this.isInProgress = false;
                            if (response && response.data && response.data.data.stocks && response.data.data.stocks.length) {
                                this.stocksAvailable = true;
                                response.data.data.stocks.forEach((data) => {
                                    this.stocks[data._id] = data;
                                });
                            } else {
                                this.stocksAvailable = false;
                            }

                        });
                },
                setLoggedIn() {
                    this.isLoggedIn = true;
                }
            },
            filters: {
                formatDate: function (value) {
                    if (value) {
                        return moment(String(value)).format('DD MMM YYYY hh:mm')
                    }
                },
                toFixed: function (value) {
                    if (value) {
                        return (Number(value)).toFixed(2)
                    }
                }
            }
        })
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        initApp()
    })
})()