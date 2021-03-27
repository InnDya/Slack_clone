const socket = io();

/* Form submit handler. Here I create message object, emit message 
for user and empty input field */ 
document.getElementById('form').addEventListener('submit', e => {
    e.preventDefault();

    let input = document.getElementById('input');
    let channel = location.hash.substring(1);
    if (input.value && channel.length > 0) {
        // console.log('Sending message: ' + input.value);
        message = {
            channel: channel,
            message: input.value,
            timestamp: Date.now()
        }
        socket.emit('chat message', message);
    }
    input.value = '';
});

/* Handler for uploading files, uploads file to server and inserts link
in the message edit box */
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

/* handler for message: call addMessage function which adds message to message list */
socket.on('chat message', message => {
    console.log('got message: ' + message.message);
    addMessage(message);
    let messagesList = document.getElementById('messages');
    messagesList.scrollIntoView(false);
});

/*  event listner when site is loaded. Here I fetch data about user to render user name
under user icon, and fetch list of channels from database to show on the sidebar */
document.addEventListener('DOMContentLoaded', e => {
    fetch('/user-info')
        .then(response => response.json())
        .then(userInfo => {
            const p = `<p><b>${userInfo.user}</b></p>`
            document.getElementById('user-info').innerHTML = p;
        })
        .catch(error => console.log(error));

    fetch('/channels')
        .then(response => response.json())
        .then(channels => {
            let channel_list = document.getElementById('channels')
            for (let channel of channels) {
                let li = `
                        <li id="channel_${channel._id}">
                            <a class="nav-link" href=#${channel._id}>
                                ${channel.name}
                            </a>
                        </li>`
                channel_list.innerHTML += li;
            }
            if (location.hash.length > 1) {
                window.dispatchEvent(new HashChangeEvent("hashchange"));
            }
        });
});

/* Handler on hashchange. When a user clicks on channel name in sidebar 
I get channel id and call function loadChannel.
loadChannel() fetches messages for this channel from server and renders them.
Then user join this channel. Then I erase className for all channels and add 
className = 'selected_channel' to the selected one to indicate that it's active.
 */
window.addEventListener('hashchange', function () {
    channel = location.hash.substring(1);
    loadChannel(channel);
    socket.emit('join channel', channel);
    for (let li of document.getElementById('channels').childNodes) {
        li.className = '';
    }
    let selectedChannel = document.getElementById('channel_' + channel);
    selectedChannel.className = 'selected_channel';
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