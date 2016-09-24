var User = function User(id, name, type) {
    if(arguments.length < 3) {
        return new Error('Not enough args');
    }
    return {id: id, user: name, type: type};
}

var Chat = function Chat(message, room, user) {
    if(arguments.length < 3) {
        return new Error('Not enough args');
    }

    if(typeof user !== "object") {
        return new Error('user must be an object');
    }

    return {
        id: user.id + Date.now(), 
        message: message,
        room: room,
        ts: Date.now(),
        user: user
    }
}

var Room = function Room(name) {
    if(arguments.length < 1) {
        return new Error('Room needs a name');
    }

    return {id: name, name: name};
}

exports.User = User;
exports.Room = Room;
exports.Chat = Chat;