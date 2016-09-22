var amqp = require('amqp')
, config = require('../config')
, q = require('q');

module.exports = q.Promise(function(resolve, reject){
    var rabbit = amqp.createConnection(config.rabbitMQ.URL);
    rabbit.on('ready', function(){
        resolve(rabbit);
    });
});