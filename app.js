const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
const expressEjsLayout = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
require('./config/passport')(passport);
const multer = require('multer')

const Channel = require('./models/channels');

// Storage configuration (destination: path), (filename: to save original name)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

mongoose.connect('mongodb://localhost:27017/slack')
    .then(() => console.log('connected to db'))
    .catch(error => console.log(error));


// EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(path.join(__dirname, 'public')));

// Session
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

// get name for logged in user
app.get('/user-info', ensureAuthenticated, (request, response) => {
    response.send({user: request.user.name});
});

// adding new channel
app.post('/channels', ensureAuthenticated, (request, response) => {
    const name = request.body.channel;
    const newChannel = new Channel({ name });
    newChannel.save((error, object) => {
        if (error) {
            console.log(error);
            response.sendStatus(500);
        } else {
            response.send(object);
        }
    });
});

// get channel list from db
app.get('/channels', ensureAuthenticated, (request, response) => {
    Channel
        .find()
        .exec((error, channels) => {
            if (error) {
                console.log(error);
            }
            response.send(channels);
        });
});

// get messages for specific channel
app.get('/channels/:id', (request, response) => {
    const id = request.params.id;
    Channel
        .findOne({ _id: id })
        .exec((error, channel) => {
            if (error) {
                console.log(error);
            }
            response.send(channel.messages);
        })
})

// handle file uploads
app.post('/upload', upload.single('file'), function (request, response) {
    console.log(request.file, response.body);
    response.sendStatus(200).end();
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
    Channel
        .find()
        .exec((error, channels) => {
            if (error) {
                console.log(error);
            }
            for (let channel of channels) {
                console.log('joining channel ' + channel._id);
                socket.join(channel._id.toString());
            }
        })

    socket.on('join channel', channel => {
        console.log("joining channel " + channel);
        socket.join(channel);
    });
    socket.on('chat message', message => {
        // console.log(socket.request.user.name);
        // console.log(socket.request.user.email);
        message['user'] = socket.request.user.name;
        console.log(message);
        console.log(socket.rooms);
        Channel.findById(message.channel)
            .exec((error, channel) => {
                if (error) {
                    console.log(error);
                } else {
                    channel.messages.push(message);
                    channel.save();
                    console.log('emitting message to ' + message.channel);
                    io.in(message.channel).emit('chat message', message);
                }
            })
    });

    socket.on('disconnect', () => {
        console.log('a user disconnected');
    });
});

http.listen(3000);