var passport = require('passport');
var facebook = require('passport-facebook').Strategy;
var config = require('../config');

passport.use(new facebook({
    clientID: config.facebook.appID,
    clientSecret: config.facebook.appSecret,
    callbackURL: config.host + config.routes.facebookAuthCallback
}, function(accessToken, refreshToken, profile, done){
    done(null, profile);
}));

passport.serializeUser(function(user, done){
    done(null, user);
});

passport.deserializeUser(function(user, done){
    done(null, user);
});

var routes = function(app) {
    app.get(config.routes.facebookAuth, passport.authenticate('facebook'));
    app.get(config.routes.facebookAuthCallback, passport.authenticate('facebook', {
        successRedirect: config.routes.chat,
        failureRedirect: config.routes.login,
        failureFlash: true
    }));
}

exports.routes = routes;
exports.passport = passport;