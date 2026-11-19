let stompClient = null;

function connect() {
    if (stompClient !== null) return;

    const serverIp = document.getElementById('serverIp').value.trim() || window.location.hostname;
    const port = 8080;
    const protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    const socket = new SockJS(`${protocol}://${serverIp}:${port}/ws`);
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function (frame) {
        setConnected(true);
        console.log('Connected: ' + frame);
        stompClient.subscribe('/topic/public', function (message) {
            showMessage(JSON.parse(message.body));
        });
    }, function (error) {
        console.error('WebSocket connection failed:', error);
        stompClient = null;
        setConnected(false);
    });
}

function disconnect() {
    const client = stompClient;
    stompClient = null;
    if (client !== null && client.connected) {
        client.disconnect(function () {
            setConnected(false);
        });
    } else {
        setConnected(false);
    }
    console.log("Disconnected");
}

function setConnected(connected) {
    const status = document.getElementById('status');
    if (connected) {
        status.className = 'connected';
        status.textContent = 'Conectado';
    } else {
        status.className = 'disconnected';
        status.textContent = 'Desconectado';
    }
    document.getElementById('message').disabled = !connected;
}

function sendMessage() {
    const username = document.getElementById('username').value;
    const content = document.getElementById('message').value;

    if (content.trim() === '' || stompClient === null) return;

    stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({ tipo: 'CHAT', usuario: username, contenido: content }));

    document.getElementById('message').value = '';
}

function showMessage(message) {
    const messages = document.getElementById('messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    const username = document.createElement('strong');
    username.textContent = message.usuario + ':';
    messageDiv.append(username, document.createTextNode(' ' + message.contenido));
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Allow sending message with Enter key
document.getElementById('message').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
