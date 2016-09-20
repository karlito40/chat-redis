var util = require('../middleware/utilities');
var config = require('../config');

module.exports.index = index;
module.exports.login = login;
module.exports.loginProcess = loginProcess;
module.exports.chat = chat;
module.exports.logOut = logOut;

function index(req, res) {
    res.render('index', {
        title: 'Index 4', 
        layout: 'layout',
    });
}

function login(req, res) {
    res.render('login', {
        title: 'Login',
        message: req.flash('error')
    });
}

function loginProcess(req, res) {
    var isAuth = util.auth(req.body.username, req.body.password, req.session);
    if(isAuth) {
        res.redirect(config.routes.chat);
    } else {
        req.flash('error', 'Wrong username or password');
        res.redirect(config.routes.login);
    }
}

function chat(req, res) {
    res.render('chat', {title: 'Chat'});
}

function logOut(req, res) {
    util.logOut(req);
    res.redirect('/');
}