const crypto = require('crypto');
const io = require('socket.io-client');

const socket = io('http://localhost:3000'); // Update with listener's URL

const names = ['Alice', 'Bob', 'Charlie'];
const origins = ['CityA', 'CityB', 'CityC'];
const destinations = ['CityX', 'CityY', 'CityZ'];

function generateSecretKey(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

function encryptMessage(message, key) {
  const cipher = crypto.createCipher('aes-256-ctr', key);
  return cipher.update(JSON.stringify(message), 'utf8', 'hex');
}

function generateRandomMessage() {
  const name = names[Math.floor(Math.random() * names.length)];
  const origin = origins[Math.floor(Math.random() * origins.length)];
  const destination = destinations[Math.floor(Math.random() * destinations.length)];
  
  const message = {
    name,
    origin,
    destination,
    secret_key: generateSecretKey({ name, origin, destination }),
  };
  
  const passKey = 'Vikas_(999)';
  const encryptedMessage = encryptMessage(message, passKey);

  return encryptedMessage;
}

function generateStream() {
  const numberOfMessages = Math.floor(Math.random() * (499 - 49 + 1)) + 49;
  const stream = [];

  for (let i = 0; i < numberOfMessages; i++) {
    stream.push(generateRandomMessage());
  }

  return stream.join('|');
}

setInterval(() => {
  const messageStream = generateStream();
  socket.emit('encryptedStream', messageStream);
}, 10000);
