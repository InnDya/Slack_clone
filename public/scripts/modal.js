document.addEventListener('DOMContentLoaded', e => {
    document
        .getElementById('submit_channel')
        .addEventListener('click', e => {
            
            let channel = document.getElementById('channel').value;
            console.log(channel);
            let link = document.createElement('a');
            link.className = 'nav-link';
            link.innerText = channel;
            let li = document.getElementById('channels_list');
            li.appendChild(link);
            document.querySelector('ul#channels').appendChild(li);

        })
})
        