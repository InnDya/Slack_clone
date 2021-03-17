const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const router = express.Router();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
require('./config/passport')(passport);

mongoose.connect('mongodb://localhost:27017/slack')
    .then(() => console.log('connected to db'))
    .catch(error => console.log(error));

// EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Flash
app.use(flash());
app.use((request, response, next) => {
    response.locals.success_msg = request.flash('success_msg');
    response.locals.error_msg = request.flash('error_msg');
    response.locals.error = request.flash('error');
    next();
});

const { ensureAuthenticated } = require('./config/auth');
app.get('/', ensureAuthenticated, (request, response) => {
    response.sendFile(__dirname + '/html/index.html');
});

// Routes
app.use('/', require('./routes/auth'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', message => {
        // console.log('Recieved message: ' + message);
        io.emit('chat message', message);
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

http.listen(3000);