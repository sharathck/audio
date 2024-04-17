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
    fetch('https://us-central1-reviewtext-ad5c6.cloudfunctions.net/function-1')
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
            </li>
          ))}
        </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
