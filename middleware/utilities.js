var config = require('../config');

module.exports.templateRoutes = function(req, res, next) {
    res.locals.routes = config.routes;
    next();
}

module.exports.csrf = function(req, res, next) {
    res.locals.token = req.csrfToken();
    next();
}

module.exports.authenticated = function(req, res, next) {
    req.session.isAuthenticated = req.session.passport.user !== undefined;
    res.locals.isAuthenticated = req.session.isAuthenticated;
    if(req.session.isAuthenticated) {
        res.locals.user = req.session.passport.user;
    }
    next();
}

module.exports.requireAuthentification = function(req, res, next) {
    if(req.session.isAuthenticated) {
        next();
    } else {
        res.redirect(config.routes.login);
    }
}

module.exports.auth = function(username, password, session) {
    var isAuth = (username === 'admin' && password === 'password');
    if(isAuth) {
        session.isAuthenticated = isAuth;
        session.user = {username: username};
    }
    return isAuth;
}

module.exports.logOut = function(req) {
    req.session.isAuthenticated = false;
    req.logout();
}
