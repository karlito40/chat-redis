var io = require('socket.io');
var config = require('../config');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var redis = require('redis');
var ConnectRedis = require('connect-redis')(expressSession);
var redisAdapter = require('socket.io-redis');

var redisSession = new ConnectRedis({
    host: config.redisHost,
    port: config.redisPort
})

var socketAuth = function(socket, next) {
    var handshakeData = socket.request;
    var parsedCookie = cookie.parse(handshakeData.headers.cookie);
    var sid = cookieParser.signedCookie(parsedCookie['connect.sid'], config.secret);
    if(parsedCookie['connect.sid'] === sid) {
        console.log('Not authenticated');
        return next(new Error('Not authenticated'));
    } 

    redisSession.get(sid, function(err, session){
        if(session.isAuthenticated) {
            socket.user = session.user;
            socket.sid = sid;
            return next();
        }
        return next(new Error('Not authenticated'));
    })
}

var socketConnection = function(socket) {
    socket.on('GetMe', function(){});
    socket.on('GetUser', function(room){});
    socket.on('GetChat', function(data){});
    socket.on('AddChat', function(chat){});
    socket.on('GetRoom', function(){});
    socket.on('AddRoom', function(r){});
    socket.on('disconnect', function(){});
}

exports.startIo = function(server) {
    io = io.listen(server);
    io.adapter(redisAdapter({
        host: config.redisHost,
        port: config.redisPort 
    }))
    var chat = io.of('/chat');

    chat.use(socketAuth);
    chat.on('connection', socketConnection);

    return io;
}