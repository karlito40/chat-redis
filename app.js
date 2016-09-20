var express = require('express');
var app = express();
var routes = require('./routes');
var errorHandlers = require('./middleware/errorhandlers');
var log = require('./middleware/log');
var util = require('./middleware/utilities');
var partials = require('express-partials')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyParser = require('body-parser');
var csrf = require('csurf');
var flash = require('connect-flash');
var config = require('./config');
var io = require('./socket.io');

app.set('view engine', 'ejs');
app.set('view options', {defaultLayout: 'layout'})
app.use(log.logger);
app.use(express.static(__dirname + '/static'));
app.use(partials());
app.use(cookieParser(config.secret));
app.use(session({
    secret: config.secret,
    saveUninitialized: true,
    resave:true,
    store: new RedisStore({
        url: config.redisUrl
    })
}));
app.use(flash());
app.use(util.templateRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(csrf());
app.use(util.csrf);
app.use(util.authenticated);

app.get('/', routes.index);
app.get(config.routes.login, routes.login);
app.post(config.routes.login, routes.loginProcess);
app.get('/chat', [util.requireAuthentification], routes.chat);
app.get(config.routes.logout, routes.logOut);

app.use(errorHandlers.error);
app.use(errorHandlers.notFound);

var server = app.listen(config.port);
io.startIo(server);

console.log('App running on port ' + config.port);