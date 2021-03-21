const socket = io();

let form = document.getElementById('form');
let input = document.getElementById('input');

form.addEventListener('submit', e => {
    e.preventDefault();

    if (input.value) {
        // console.log('Sending message: ' + input.value);
        channel = location.hash.substring(1);
        message = {
            channel: channel,
            message: input.value,
            timestamp: Date.now()
        }
        socket.emit('chat message', message);
    }
    input.value = '';
});

socket.on('chat message', message => {
    console.log('got message: ' + message);
    addMessage(message);
});

document.addEventListener('DOMContentLoaded', e => {
    fetch('/channels')
        .then(response => response.json())
        .then(channels => {
            let channel_list = document.getElementById('channels')
            for (let channel of channels) {
                let li = `
                        <li>
                            <a class="nav-link" href=#${channel._id}>
                                ${channel.name}
                            </a>
                        </li>`

                channel_list.innerHTML += li;
            }
        });
    if (location.hash.length > 1) {
        channel = location.hash.substring(1);
        loadChannel(channel);
    }
});

window.addEventListener('hashchange', function() {
    channel = location.hash.substring(1);
    loadChannel(channel);
}, false);

function loadChannel(channel) {
    fetch('/channels/' + channel)
        .then(response => response.json())
        .then(messages => {
            document.getElementById('messages').innerHTML = '';
            for (let message of messages) {
                addMessage(message);
            }
        });    
}

function addMessage(message) {
    let item = document.createElement('li');
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    item.innerHTML = '[' + dateStr + '] ' + '<b>' + message.user + '</b>: ' + message.message;

    document.getElementById('messages').appendChild(item);
}