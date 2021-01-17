const oauth = 'oauth:t1ajnztqpjhi9mf8fvpc9xr4m583p8';
const steve = window.steve;
const name = steve ? 'steve' : prompt('Enter your name').trim();

const channel = 'mizium2';

// Define configuration options
const opts = {
    connection: {
		secure: true,
		reconnect: true
	},
    identity: {
        username: channel,
        password: oauth,
    },
    channels: [
        channel,
    ],
};


const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

let lastMessage = '';

document.getElementById('guess_form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (steve) { return false; }
    let guess = event.target[0].value;

    event.target[0].value = '';

    guess = guess.trim();
    if (!guess.length) {
	guess = lastMessage;
    }
    else {
	lastMessage = guess;
    }
    sendGuess(guess);
    showMessage({
        name,
        guess,
    });

    return false;
});

nameColorMap = {};
colorIndex = 0;

const colors = ['#2f7ed8', '#00ff00', '#8bbc21', '#ffcc00', '#ffffff', '#ff00ff'];

function showMessage(payloadObject) {
    let color = nameColorMap[payloadObject.name];

    if (!color) {
        color = nameColorMap[payloadObject.name] = colors[colorIndex];

        colorIndex++;

        if (colorIndex === colors.length) {
            colorIndex = 0;
        }
    }

    let messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    let nameDiv = document.createElement('div');
    nameDiv.className = 'name';
    nameDiv.style = `color: ${color};`;
    let guessDiv = document.createElement('div');
    guessDiv.className = 'guess';

    nameDiv.textContent = `${payloadObject.name} (${(new Date()).toLocaleTimeString()})`;
    guessDiv.textContent = payloadObject.guess;

    messageDiv.append(nameDiv);
    messageDiv.append(guessDiv);

    document.getElementById('messages').style.display = 'none';
    document.getElementById('messages').prepend(messageDiv);
    document.getElementById('messages').style.display = 'block';
}

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
    if (self || !steve) { return; } // Ignore messages 

    // Remove whitespace from chat message
    const rawPayload = msg.trim();

    const decodedPayload = atob(rawPayload);

    let payloadObject;

    try {
        payloadObject = JSON.parse(decodedPayload);

        showMessage(payloadObject);
    }
    catch(err) {
        console.error(err.message);
    }
}

function sendGuess(guess) {
    const packet = {
        name,
        guess,
    };

    const payload = btoa(JSON.stringify(packet));

    client.say(channel, payload);
}

function onConnectedHandler(addr, port) {
}

document.getElementById('reset').addEventListener('click', () => {
    document.getElementById('messages').innerHTML = '';
});
