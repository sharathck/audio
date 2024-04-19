import './App.css';
import React, { useEffect, useState, useRef } from 'react';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

function App() {
  const [files, setFiles] = useState([]);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = useState(null);
  const playerRef = useRef(null);

  useEffect(() => {
    //fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-1')
    fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-6')
      .then(response => response.json())
      .then(data => {
        console.log('Data fetched: ', data);
        setFiles(data);
      })
      .catch(error => console.error('Error fetching data: ', error));
  }, []);

  const setAudioSource = (url, index) => {
    setCurrentFileUrl(url);
    setIsPlaying(true);
    setSelectedFileIndex(index);
  };

  const handleCheckboxChange = (e, file) => {
    e.preventDefault();
    const requestBody = {
      filename: file.name
    };
    fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-6', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('API request failed');
        }
        return response.json();
      })
      .then(data => { console.log('Checkbox clicked: ', data); })
      .catch(error => console.error('Error calling API: ', error));
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="" style={{ width: '90%' }}>
          <H5AudioPlayer
            ref={playerRef}
            src={currentFileUrl}
            autoPlay={isPlaying}
            controls={true}
            onError={(error) => console.error('Error loading or playing audio:', error)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              const nextFileIndex = (selectedFileIndex + 1) % files.length;
              setAudioSource(files[nextFileIndex].url, nextFileIndex);
            }}
          />

          <ul style={{ listStyleType: 'none' }}>
            {files.map((file, index) => (
              <li
                key={index}
                className={selectedFileIndex === index ? 'selected-file' : ''}
              >
                <a href={file.url} onClick={(e) => { e.preventDefault(); setAudioSource(file.url, index); }}>
                  {file.name}
                </a>
                <input type="checkbox" onChange={(e) => handleCheckboxChange(e, file)} style={{ width: '20px', height: '20px', backgroundColor: '#fff', border: '2px solid #000', borderRadius: '5px', marginLeft: '20px' }} />
                <a href={file.url} onClick={(e) => { e.preventDefault(); setAudioSource(file.url, index); }}>                </a>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
