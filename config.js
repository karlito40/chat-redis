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
    },
    host: 'http://localhost:3000',
    facebook: {
        appID: '307019789671712',
        appSecret: '13a8d67b25c910bbdecab77b5dd3c9c9'
    }
};

module.exports = config;