var client = require('./index').client,
q = require('q'),
models = require('./models');

exports.addUser = function(user, name, type) {
    client.multi()
        .hset('user:' + user, 'name', name)
        .hset('user:' + user, 'type', type)
        .zadd('users', Date.now(), user)
        .exec();

}

exports.addRoom = function(room) {
    if(room !== '') {
        client.zadd('rooms', Date.now(), room);
    }
}

exports.getRooms = function(cb) {
    client.zrevrangebyscore('rooms', '+inf', '-inf', function(err, data) {
        return cb(data);
    });
} 

exports.addChat = function(chat) {
    client.multi()
        .zadd('rooms:' + chat.room + ':chats', Date.now(), JSON.stringify(chat))
        .zadd('users', Date.now(), chat.user.id)
        .zadd('rooms', Date.now(), chat.room)
        .exec();

}

exports.getChat = function(room, cb) {
    client.zrange('rooms:' + room + ':chats', 0, -1, function(err, chats) {
        cb(chats);
    })
}

exports.addUserToRoom = function(user, room) {
    client.multi()
        .zadd('rooms:' + room, Date.now(), user)
        .zadd('users', Date.now(), user)
        .zadd('room', Date.now(), room)
        .set('user:' + user + ':room', room)
        .exec();
}

exports.removeUserFromRoom = function(user, room) {
    client.multi()
        .zrem('room:'+room, user)
        .del('user:'+user+':room')
        .exec();
}

exports.getUsersInRoom = function(room) {
    return q.Promise(function(resolve, reject){
        client.zrange('rooms:' + room, 0, -1, function(err, data){
            var users = [];
            var loopsleft = data.length;
            data.forEach(function(u){
                client.hgetall('user:'+u, function(err, userHash){
                    users.push(models.User(u, userHash.name, userHash.type));
                    loopsleft--;
                    if(loopsleft == 0) {
                        resolve(users);
                    }
                })
            })
        })
    })
}