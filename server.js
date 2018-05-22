var path = require('path');
var express = require('express');
var app = express();
var webpack = require('webpack');
var config = require('./webpack.config');
var server =require('http').createServer(app);
var io = require('socket.io')(server);
var compiler = webpack(config);

app.use(express.static(path.join(__dirname, '/')))

app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));
app.use(require('webpack-hot-middleware')(compiler));

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, 'index.html'));
})

// onlineUsers
var onlineUsers = {};
// onlineCount
var onlineCount = 0;

io.on('connection', function(socket) {
    // watch client login
    socket.on('login', function(obj){
        
        // set socketid to obj.uid
        socket.id = obj.uid;

        // if user not exist, onlineCount++ and add to onlineUsers
        if (!onlineUsers.hasOwnProperty(obj.uid)) {
            onlineUsers[obj.uid] = obj.username;
            onlineCount++;
        }

        // send 'login' event to client, and send onlineUsers, onlineCount, login user
        io.emit('login', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
        console.log(obj.username+'join Chat Room');
    })

    // watch client disconnect
    socket.on('disconnect', function() {

        // if user exists
        if(onlineUsers.hasOwnProperty(socket.id)) {
            var obj = {uid:socket.id, username:onlineUsers[socket.id]};

            // delete the user, onlinCount--
            delete onlineUsers[socket.id];
            onlineCount--;

            // send 'login' event to client，send onlineUsers, onlineCount, logout user
            io.emit('logout', {onlineUsers:onlineUsers, onlineCount:onlineCount, user:obj});
            console.log(obj.username+'退出了群聊');
        }
    })

    // watch client message
    socket.on('message', function(obj){
        io.emit('message', obj);
        console.log(obj.username+"says:"+ obj.message);
    })

})

server.listen(3000, function(err) {
    console.log('Listening at *:3000');
})