var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var server = app.listen(7076);

var io = require('socket.io').listen(server);

var usernames = [];
var connectCounter = 0;
var clientId = 0;

io.sockets.on('connection', function (socket) {

        // Quand un client se connecte, on met à jour son statut 
        socket.emit('message', 'Connecté');
        // on incrémente le compteur de visite
        connectCounter++;
        clientId++;
        // on genere le pseudo par défaut
        socket._id = clientId;
        socket.pseudo = "user" + socket._id;
        usernames[socket._id] = socket.pseudo;
        // on envoit le tout 
        io.sockets.emit('newConnexion', {compteur:connectCounter, pseudo:socket.pseudo, listeUtilisateurs: usernames});

        // un utilisateur change son pseudo
        socket.on('pseudoChanged', function(data){
            socket.pseudo = data.newPseudo;
            socket.oldpseudo = data.oldPseudo;
            io.sockets.emit('aPseudoChanged', {newPseudo : socket.pseudo, oldPseudo : socket.oldpseudo});
        });

        // un utilisateur parle
        socket.on('messageSent', function(data){
            socket.message = data;
            io.sockets.emit('messageBroadcast', {user : socket.pseudo, message : socket.message});
        });

        //Quand un client se deconnecte
        socket.on('disconnect', function(){
            // Decrementation compteur des connexions
            connectCounter--;
            // Delete user from userlist
            var i = usernames.indexOf(socket.pseudo);
            if(i != -1) {
                usernames.splice(i, 1);
            }
            console.log(usernames);
            io.sockets.emit('endConnexion', {compteur:connectCounter, pseudo:socket.pseudo, listeUtilisateurs: usernames});
        });

});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
