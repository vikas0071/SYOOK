import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:3000'); // Update with your listener's URL

function App() {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Listener');
    });

    socket.on('dataUpdate', (newData) => {
      setData(newData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Time Series Data</h1>
      <ul>
        {data.map((message, index) => (
          <li key={index}>
            <pre>{JSON.stringify(message, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
