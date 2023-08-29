const crypto = require('crypto');
const io = require('socket.io')();
const MongoClient = require('mongodb').MongoClient;

const mongoUrl = 'mongodb://localhost:27017'; // Update with your MongoDB URL

io.on('connection', (socket) => {
  console.log('Emitter connected');

  socket.on('encryptedStream', async (stream) => {
    const passKey = 'Vikas_(999)';
    const decryptedStream = decryptStream(stream, passKey);
    const messages = decryptedStream.split('|');
    
    const validMessages = await validateMessages(messages);

    if (validMessages.length > 0) {
      saveMessagesToDB(validMessages);
    }
  });

  socket.on('disconnect', () => {
    console.log('Emitter disconnected');
  });
});

function decryptStream(stream, key) {
  const decipher = crypto.createDecipher('aes-256-ctr', key);
  return decipher.update(stream, 'hex', 'utf8');
}

async function validateMessages(messages) {
  const validMessages = [];
  for (const message of messages) {
    const parsedMessage = JSON.parse(message);
    const calculatedKey = generateSecretKey(parsedMessage);
    
    if (calculatedKey === parsedMessage.secret_key) {
      validMessages.push(parsedMessage);
    }
  }
  return validMessages;
}

function generateSecretKey(obj) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

async function saveMessagesToDB(messages) {
  const client = new MongoClient(mongoUrl, { useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db('time_series_db');
    const minute = new Date().toISOString().substring(0, 16);

    const collection = db.collection(minute);
    await collection.insertMany(messages);
    console.log(`Saved ${messages.length} messages for ${minute}`);
  } catch (error) {
    console.error('Error saving messages:', error);
  } finally {
    client.close();
  }
}

io.listen(3000);
