var config = {
    port: 3000,
    secret: 'secret',
    redisPort: 6379,
    redisHost: 'localhost',
    redisUrl: 'redis://localhost',
    routes: {
        login: '/login',
        logout: '/logout',
        chat: '/chat',
        facebookAuth: '/auth/facebook',
        facebookAuthCallback: '/auth/facebook/callback',
        googleAuth: '/auth/google',
        googleAuthCallback: '/auth/google/callback',
    },
    host: 'http://localhost:3000',
    facebook: {
        appID: '307019789671712',
        appSecret: '13a8d67b25c910bbdecab77b5dd3c9c9'
    },
    google: {
        clientID: '457857694846-f2hfnjal9qsckcht4ece9i0v6i9dckqj.apps.googleusercontent.com',
        clientSecret: '1zUqz8chojvbd56NbgMvVtsw'
    },
    crypto: {
        workFactor: 5000,
        keylen: 32,
        randomSize: 256
    },
    rabbitMQ: {
        URL: 'amqp://guest:guest@localhost:5672',
        exchange: 'chat.log'
    }
};

module.exports = config;