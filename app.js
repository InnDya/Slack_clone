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

mongoose.connect('mongodb://localhost:27017/slack')
    .then(() => console.log('connected to db'))
    .catch(error => console.log(error));

// EJS
app.set('view engine', 'ejs');
app.use(expressEjsLayout);

app.use(express.urlencoded({ extended: true }));


app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/html/index.html');
});

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

// Routes
app.use('/', require('./routes/index'));
app.use('/', require('./routes/users'));

http.listen(3000);