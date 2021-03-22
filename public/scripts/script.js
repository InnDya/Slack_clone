const socket = io();

document.getElementById('form').addEventListener('submit', e => {
    e.preventDefault();

    let input = document.getElementById('input');
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

document.getElementById('form-upload').addEventListener('submit', e => {
    e.preventDefault();
    const input = document.getElementById('fileinput');
    const file = input.files[0];
    const data = new FormData();
    data.append('file', file);
    fetch('/upload', {
        method: 'POST',
        body: data
    })
    .then(response => {
        const text = '<a href="/public/uploads/' + file.name + '" target=_blank>' + file.name + '</a>';
        document.getElementById('input').value = text;
    })
    .catch(error => console.log(error));
});

socket.on('chat message', message => {
    console.log('got message: ' + message.message);
    addMessage(message);
    let messagesList = document.getElementById('messages');
    messagesList.scrollIntoView(false);
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

window.addEventListener('hashchange', function () {
    channel = location.hash.substring(1);
    loadChannel(channel);
}, false);

function loadChannel(channel) {
    fetch('/channels/' + channel)
        .then(response => response.json())
        .then(messages => {
            let messagesList = document.getElementById('messages');
            messagesList.innerHTML = '';
            for (let message of messages) {
                addMessage(message);
            }
            messagesList.scrollIntoView(false);
        });
}

function addMessage(message) {
    let item = document.createElement('li');
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    item.innerHTML = '[' + dateStr + '] ' + '<b>' + message.user + '</b>: ' + message.message;

    document.getElementById('messages').appendChild(item);
}