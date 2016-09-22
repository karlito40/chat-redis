var passport = require('passport');
var Facebook = require('passport-facebook').Strategy;
var config = require('../config');
var Google = require('passport-google-oauth').OAuth2Strategy;
var Local = require('passport-local').Strategy;

passport.use(new Facebook({
    clientID: config.facebook.appID,
    clientSecret: config.facebook.appSecret,
    callbackURL: config.host + config.routes.facebookAuthCallback
}, function(accessToken, refreshToken, profile, done){
    done(null, profile);
}));

passport.use(new Google({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.host + config.routes.googleAuthCallback
}, function(accessToken, refreshToken, profile, done){
    done(null, profile);
}));

passport.use(new Local(function(username, password, done){
    done(null, {
        id: "ezor334",
        displayName: 'karl martin',
        username: 'karl'
    })
}))


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
    app.get(config.routes.googleAuth, passport.authenticate('google', {
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ]
    }));
    app.get(config.routes.googleAuthCallback, passport.authenticate('google', {
        successRedirect: config.routes.chat,
        failureRedirect: config.routes.login,
        failureFlash: true
    }));
    app.post(config.routes.login, passport.authenticate('local', {
        successRedirect: config.routes.chat,
        failureRedirect: config.routes.login,
        failureFlash: true 
    }))
}

exports.routes = routes;
exports.passport = passport;