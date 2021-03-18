const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
// const router = express.Router();
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport')(passport);

mongoose.connect('mongodb://localhost:27017/slack')
    .then(() => console.log('connected to db'))
    .catch(error => console.log(error));

// const Users = require('./models/users');
const Channels = require('./models/channels');

// EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

app.use(express.urlencoded({ extended: false }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// Session
// app.use(session({
//     name: 'slack',
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true
// }));
const sessionStore = MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/slack' });
const sessionMiddleware = session({
    name: 'slack',
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: sessionStore
});
app.use(sessionMiddleware);
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

io.use((socket, next) => sessionMiddleware(socket.request, {}, next));
io.use((socket, next) => {
    const middleware = passport.initialize();
    middleware(socket.request, {}, next);
});
io.use((socket, next) => {
    const middleware = passport.session();
    middleware(socket.request, {}, next);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('chat message', message => {
        // console.log(socket.request.user.name);
        // console.log(socket.request.user.email);
        console.log(message.channel + ' [' + socket.request.user.name + ']: ' + message.message);
        io.emit('chat message', message);
        Channels.findOne({ name: message.channel })
            .exec((error, channel) => {
                if (error) {
                    console.log(error);
                } else {
                    channel.messages.push(message.message);
                    channel.save();
                }
            })
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

http.listen(3000);