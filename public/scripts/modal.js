document.addEventListener('DOMContentLoaded', e => {
    document
        .getElementById('submit_channel')
        .addEventListener('click', e => {
            let channel = document.getElementById('channel').value;
            console.log(channel);
            fetch('/channels', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ channel: channel })
            })
                .then(response => {
                    let li = `
                    <li>
                        <a class="nav-link" href="#">
                            ${channel}
                        </a>
                    </li>`

                    document.getElementById('channels').innerHTML += li;
                    document.getElementById('channel').value = '';
                })
                .catch(error => console.log(error));
        });

});
