const app = require('express')();
const http = require('http').Server(app);
const cors = require('cors');

const io = require("socket.io");


//Socket.IO works by adding event listeners to an instance of http.Server
const socket = io(http);
const {
    Streamer
} = require("./server/utils/streamer")

app.use(cors({
    credentials: true,
    origin: true,
}));
// body-parser to handle request data
app.use(require('body-parser').json({
    limit: '10mb'
}));
app.use(require('body-parser').urlencoded({
    extended: true
}));

require("./server/utils/sessions").initSessionStore(app).then(() => {
    require("./server/utils/passport").configure(app,require("./server/utils/utils").Utils);
    require('./server/routes').establishRoutes(app);
    startServer();
});

//To listen to messages on socket
socket.on("connection", (socket) => {
    console.log("user connected");
    socket.on("disconnect", () => {
        console.log("Disconnected")
    })
});


function startServer() {
    const port = process.env.PORT || 3300;
    http.listen(port, function () {
        var host = http.address().address
        var port = http.address().port

        console.log("App listening at http://%s:%s", host, port)
        Streamer.init(socket);
    });
}

process.on('uncaughtException', function (err) {
    console.log('Uncaught exception has been handled. Exception caught is ');
    console.log(err.toString());
    console.log(err.stack);
});