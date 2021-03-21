const socket = io();

let form = document.getElementById('form');
let input = document.getElementById('input');
let messages = document.getElementById('messages');

form.addEventListener('submit', e => {
    e.preventDefault();

    if (input.value) {
        // console.log('Sending message: ' + input.value);
        socket.emit('chat message', { channel: "channel #1", message: input.value });
    }
    input.value = '';
});

socket.on('chat message', message => {
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
                            <a class="nav-link" href=/channels/${channel._id}>
                                ${channel.name}
                            </a>
                        </li>`

                channel_list.innerHTML += li;
            }
        });
    fetch('/channels/6053b42956f6c274eab68478')
        .then(response => response.json())
        .then(messages => {
            for (let message of messages) {
                addMessage(message);
            }
        });    
});

function addMessage(message) {
    let item = document.createElement('li');
    const date = new Date(message.timestamp);
    const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    item.innerHTML = '[' + dateStr + '] ' + '<b>' + message.user + '</b>: ' + message.message;

    messages.appendChild(item);
}