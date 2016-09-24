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
});
var redisChat = require('../redis/chat'),
models = require('../redis/models'),
log = require('../middleware/log');

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
            redisChat.addUser(
                session.passport.user.id,
                session.passport.user.displayName,
                session.passport.user.provider
            );
            return next();
        }
        return next(new Error('Not authenticated'));
    })
}

var removeFromRoom = function(socket, room) {
    socket.leave(room);
    redisChat.removeUserFromRoom(
        socket.request.user.id,
        room
    )

    socket.broadcast.to(room).emit('RemoveUser', models.User(
            socket.request.user.id,
            socket.request.user.displayName,
            socket.request.user.provider
        )
    )
}

var removeAllRooms = function(socket, cb) {
    var current = socket.rooms;
    var len = Object.keys(current).length;
    var i=0;
    for(var r in current) {
        if(current !== socket.id) {
            removeFromRoom(socket, current[r])
        }
        i++
        if(i==len) cb();
    }
}

var socketConnection = function(socket) {
    socket.on('GetMe', function(){
        socket.emit('GetMe', models.User(
            socket.request.user.id,
            socket.request.user.displayName,
            socket.request.user.provider
        ));
    });
    socket.on('GetUser', function(room){});
    socket.on('GetChat', function(data){
        redisChat.getChat(data.room, function(chats){
            var retArray = [];
            var len = chats.length;
            chats.forEach(function(c){
                try {
                    retArray.push(JSON.parse(c));
                } catch(e) {
                    log.error(e.message);
                }
                len--;
                if(len == 0) {
                    socket.emit('GetChat', retArray);
                }
            })
        })
    });
    socket.on('AddChat', function(chat){
        var newChat = models.Chat(chat.message, chat.room, models.User(
            socket.handshake.user.id,
            socket.handshake.user.displayName,
            socket.handshake.user.provider
        ));

        redisChat.addChat(newChat);
        socket.broadcast.to(chat.room).emit('AddChat', newChat);
        socket.emit('AddChat', newChat);
    });
    socket.on('GetRoom', function(){
        redisChat.getRooms(function(rooms) {
            var retArray = [];
            var len = rooms.length;
            rooms.forEach(function(r) {
                retArray.push(models.Room(r));
                len--;
                if(len == 0) {
                    socket.emit('GetRoom', retArray);
                }
            })
        })
    });
    socket.on('AddRoom', function(r){
        var room = r.name;
        removeAllRooms(socket, function(){
            if(room != '') {
                socket.join(room);
                redisChat.addRoom(room);
                socket.broadcast.emit('AddRoom', models.Room(room));
                socket.broadcast.to(room).emit('AddUser', models.User(
                    socket.handshake.user.id,
                    socket.handshake.user.displayName,
                    socket.handshake.user.provider
                ));
                redisChat.addUserToRoom(socket.handshake.user.id, room);
            }
        })
    });
    socket.on('disconnect', function(){
        removeAllRooms(socket, function(){});
    });
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