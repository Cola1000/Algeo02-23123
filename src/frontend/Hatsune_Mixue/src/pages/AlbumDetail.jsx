import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import albumPictures from '../components/albumPictures.jsx';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx'


const AlbumDetail = () => {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const album = albumPictures.find((a) => a.id === parseInt(albumId));

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

  useEffect(() => {
    applyTheme(); // Check and apply the theme on page load
  }, []);

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
        {/* Album Cover */}
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

        {/* Song List */}
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
                <span>{song.title}</span>
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
    </div>
  );
};

export default AlbumDetail;
