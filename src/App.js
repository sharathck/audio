import './App.css';
import ReactPlayer from 'react-player';
import React, { useEffect, useState, useRef } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

function App() {
  const [files, setFiles] = useState([]);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const setAudioSource = (url) => {
    setCurrentFileUrl(url);
    setIsPlaying(true);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (progress) => {
    setProgress(progress.played);
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    playerRef.current.seekTo(seekTime);
  };

  return (
    <div className="App">
      <header className="App-header">
      <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={progress}
          onChange={handleSeek}
          style={{ position: 'relative',width: '90%', height: '40%' }} // Increase width and height here
        />
        <div className=''>
          <ReactPlayer
            ref={playerRef}
            url={currentFileUrl}
            playing={isPlaying}
            controls={true}
            width="800"
            height="300"
            onError={(error) => console.error('Error loading or playing audio:', error)}
            onProgress={handleProgress}
            style={{ position: 'fixed',width: '90%', height: '20%' }}
          />
          {isPlaying ? (
            <PauseCircleOutlined onClick={handlePlayPause} style={{ fontSize: '68px', color: 'red' }} />
          ) : (
            <PlayCircleOutlined onClick={handlePlayPause} style={{ fontSize: '54px', color: 'green' }} />
          )}
        </div>
        <ul>
          {files.map((file, index) => (
            <li key={index} style={{ color: 'blue', height : '55px',  }}>
              <a href={file.url} onClick={(e) => { e.preventDefault(); setAudioSource(file.url); }}>
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
