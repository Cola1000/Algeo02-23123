import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import albumPictures from '../components/albumPictures.jsx';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx';

const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const album = albumPictures.find((a) => a.id === parseInt(albumId));

  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingSongId, setPlayingSongId] = useState(null);

  // Player states
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);

  if (!album) {
    return <div>Album not found</div>;
  }

  const handleDownloadImage = () => {
    alert('Downloading album cover image...');
  };

  const handleDownloadSong = (songId) => {
    alert(`Downloading song ID: ${songId}`);
  };

  const handleDownloadAll = () => {
    alert('Downloading all songs and album cover as ZIP...');
  };

  // Handle playing a new song
  const handlePlaySong = (songId, songFile) => {
    if (playingSongId === songId) {
      // If same song: toggle play/pause
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      // Different song
      // Stop current
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const newAudio = new Audio(songFile);
      audioRef.current = newAudio;
      newAudio.volume = volume;

      newAudio.addEventListener('loadedmetadata', () => {
        setDuration(newAudio.duration);
      });

      newAudio.addEventListener('timeupdate', () => {
        setCurrentTime(newAudio.currentTime);
      });

      newAudio.addEventListener('ended', () => {
        // When ended, reset
        setIsPlaying(false);
        setCurrentTime(0);
      });

      newAudio.playbackRate = playbackRate;

      newAudio.play().then(() => {
        setIsPlaying(true);
      });

      setCurrentAudio(newAudio);
      setPlayingSongId(songId);
    }
  };

  useEffect(() => {
    applyTheme();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Player Controls
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 5, 0);
  };

  const handleFastForward = () => {
    if (!audioRef.current || !duration) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 5, duration);
  };

  const handleSpeedChange = (e) => {
    const rate = parseFloat(e.target.value);
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return "0:00";
    const minutes = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-8 relative">
      <HillBackground />

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 text-white-500 hover:underline z-10"
      >
        &larr; Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 mt-16 text-black dark:text-white">
        <div className="flex-shrink-0">
          <img
            src={album.imageSrc}
            alt={album.title}
            className="w-64 h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleDownloadImage}
            className="mt-4 btn shadow-md hover:shadow-lg bg-blue-500 text-white rounded-lg px-4 py-2"
          >
            Download Album Cover
          </button>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-4">{album.title}</h2>
          <button
            onClick={handleDownloadAll}
            className="mb-5 btn shadow-md hover:shadow-lg bg-blue-500 text-white rounded-lg px-4 py-2"
          >
            Download All as ZIP
          </button>
          <ul className="space-y-2">
            {album.songs.map((song) => (
              <li
                key={song.id}
                className="mb-3 flex justify-between items-center p-3 bg-green-500 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handlePlaySong(song.id, song.file)}
                    className={`bg-white text-black rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-gray-300 ${playingSongId === song.id && isPlaying ? 'text-red-500' : ''}`}
                    title={playingSongId === song.id && isPlaying ? "Pause the music" : "Play the music"}
                  >
                    {playingSongId === song.id && isPlaying ? '❚❚' : '▶'}
                  </button>
                  <span>{song.title}</span>
                </div>
                <button
                  onClick={() => handleDownloadSong(song.id)}
                  className="text-white hover:text-blue-200"
                >
                  Download
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* This styling is so sh*t but whatever yang penting dapet bonus :v */}
      {currentAudio && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2">
            <button onClick={handleRewind} className="text-white hover:text-blue-400">⏪</button>
            <button onClick={handlePlayPause} className="text-white hover:text-blue-400">
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button onClick={handleFastForward} className="text-white hover:text-blue-400">⏩</button>
            <div className="flex items-center gap-2">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={handleSeek}
                className="w-48"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Speed:</span>
              <select value={playbackRate} onChange={handleSpeedChange} className="text-black">
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span>Volume:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetail;
