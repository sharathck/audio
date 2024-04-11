import './App.css';
import ReactPlayer from 'react-player';
import React, { useEffect, useState, useRef } from 'react';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';

function App() {
  const [files, setFiles] = useState([]);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (progress) => {
    setProgress(progress.played);

    // Check if the current file has finished playing
    if (progress.played === 1 && selectedFileIndex !== null && selectedFileIndex < files.length - 1) {
      // Play the next file in the list
      const nextFileIndex = selectedFileIndex + 1;
      const nextFileUrl = files[nextFileIndex].url;
      setAudioSource(nextFileUrl, nextFileIndex);
    }
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
          style={{ position: 'relative', width: '90%', height: '40px' }} // Increase width and height here
        />
        <div className="">
          <ReactPlayer
            ref={playerRef}
            url={currentFileUrl}
            playing={isPlaying}
            controls={true}
            width="800"
            height="300"
            onError={(error) => console.error('Error loading or playing audio:', error)}
            onProgress={handleProgress}
            style={{ position: 'fixed', width: '90%', height: '20%' }}
          />
          {isPlaying ? (
            <PauseCircleOutlined onClick={handlePlayPause} style={{ fontSize: '68px', color: 'red' }} />
          ) : (
            <PlayCircleOutlined onClick={handlePlayPause} style={{ fontSize: '54px', color: 'green' }} />
          )}
        </div>
        <ul style={{ listStyleType: 'none' }}>
          {files.map((file, index) => (
            <li
              key={index}
              style={{
                height: '55px',
                fontWeight: selectedFileIndex === index ? 'bold' : 'normal',
                textShadow: selectedFileIndex === index ? '1px 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
              }}
            >
              <a href={file.url} onClick={(e) => { e.preventDefault(); setAudioSource(file.url, index); }}>
                {file.name} ({Math.ceil(file.size / (1024 * 800))} minutes)
              </a>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
