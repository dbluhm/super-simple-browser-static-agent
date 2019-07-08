var editor = null;
var lastActiveListItem = null;
var ws = null;
var vk = null;

// Crypto messaging
crypto.ping();
crypto.register_pack_cb(function(message) {
    ws.send(message);
});
crypto.register_unpack_cb(function(message) {
    console.log("Recv:", JSON.parse(message.message));
});

function showConnect() {
    let connect_view = document.getElementById("connect");
    connect_view.hidden = false;
}

function hideConnect() {
    let connect_view = document.getElementById("connect");
    connect_view.hidden = true;
}

function showEditor() {
    let editor_view = document.getElementById("editor");
    editor_view.hidden = false;
}

function hideEditor() {
    let editor_view = document.getElementById("editor");
    editor_view.hidden = true;
}

function onConnect() {
    hideConnect();

    if (!editor) {
        // Setup json editor
        let container = document.getElementById("jsoneditor");
        let options = {
            mode: 'code',
            modes: ['code', 'text', 'tree'], // allowed modes
            onError: function (err) {
                alert(err.toString());
            },
            onModeChange: function (newMode, oldMode) {
                console.log('Mode switched from', oldMode, 'to', newMode);
            }
        };
        editor = new JSONEditor(container, options);
    }
    showEditor();

    // Connect WS
    let endpoint = document.getElementById('endpoint').value;
    vk = document.getElementById('vk').value;
    ws = new WebSocket('ws://' + endpoint);
    ws.addEventListener('message', function(event) {
        crypto.unpack_message(event.data);
    });
    ws.addEventListener('open', function(event){
        console.log('Websocket opened to agent');
        sendMessage({
            "@type": "test/protocol/1.0/ping",
            "~transport": {
                "return_route": "all"
            }
        });
    });
    ws.addEventListener('close', function(event) {
        console.log('Websocket closed, returning to connect');
        hideEditor();
        showConnect();
    });
}

function sendMessage(msg){
    //decorate message as necessary
    msg.id = (new Date()).getTime(); // ms since epoch

    console.log("Send:", msg);
    if (crypto.extension_exists) {
        crypto.pack_message(JSON.stringify(msg), vk);
    } else {
        ws.send(JSON.stringify(msg));
    }
}

function saveMessage(msg, name) {
    let savedMessages = document.getElementById("saved-messages");
    let li = document.createElement('LI');
    li.innerHTML = name;
    if (lastActiveListItem != null) {
        lastActiveListItem.setAttribute('class', 'list-group-item');
    }
    lastActiveListItem = li;
    li.setAttribute('class', 'list-group-item active');
    li.setAttribute('data', JSON.stringify(msg));
    li.onclick = function(event) {
        let li = event.target;
        li.setAttribute('class', 'list-group-item active');
        if (lastActiveListItem != null && lastActiveListItem != li) {
            lastActiveListItem.setAttribute('class', 'list-group-item');
        }
        lastActiveListItem = li;
        editor.set(JSON.parse(li.getAttribute('data')));
    };
    savedMessages.appendChild(li);
}

function onSave() {
    let inputName = document.getElementById('message-name');
    let msg = editor.get();
    let name = null;
    if (inputName.value != '') {
        name = inputName.value;
    } else {
        name = msg['@type'];
    }
    saveMessage(msg, name);
}

function onSend() {
    sendMessage(editor.get());
}

function onSaveAndSend() {
    onSave();
    onSend();
}

function onClear() {
    editor.set({});
    lastActiveListItem.setAttribute('class', 'list-group-item');
    lastActiveListItem = null;
}

function main() {
    showConnect();
}

window.onload = main;
document.getElementById("connect-btn").onclick = onConnect;
document.getElementById("save").onclick = onSave;
document.getElementById("send").onclick = onSend;
document.getElementById("save-and-send").onclick = onSaveAndSend;
document.getElementById("clear").onclick = onClear;
