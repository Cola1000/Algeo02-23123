import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import albumPictures from './albumPictures.jsx';

const Home2D = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 8;

  // State to manage selected files
  const [selectedFiles, setSelectedFiles] = useState([]);

  // State to control the visibility of the dropzone
  const [showDropzone, setShowDropzone] = useState(false);

  // Calculate total pages
  const totalPages = Math.ceil(albumPictures.length / albumsPerPage);

  // Get current albums
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = albumPictures.slice(indexOfFirstAlbum, indexOfLastAlbum);

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  // Handles the Album Picture Recognizer button click
  const handleAlbumRecognizer = () => {
    setShowDropzone(true);
  };

  // Drag and drop logic
  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
    // Implement logic to handle the uploaded files

    alert(`You have uploaded ${acceptedFiles.length} file(s).`);
    // You can process the files here

    setShowDropzone(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Handles the Audio Recognizer button click
  const handleAudioRecognizer = () => {
    const useMicrophone = window.confirm(
      "Do you want to use your microphone for audio recognition?"
    );
    if (useMicrophone) {
      navigate('/audio-recorder');
    } else {
      alert("Please select an audio file.");
      // Logic to upload an audio file goes here
      setShowDropzone(true);
    }
  };  

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      <section className="text-center">
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-6 shadow-card">
          Hatsune Mixue
        </h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-5 mt-8 z-10 relative justify-center items-center">
          <button
            onClick={handleAlbumRecognizer}
            className="btn shadow-md hover:shadow-lg"
          >
            Album Picture Recognizer
          </button>
          <button
            onClick={handleAudioRecognizer}
            className="btn shadow-md hover:shadow-lg"
          >
            Audio Recognizer
          </button>
        </div>

        {/* Drag and Drop Area */}
        {showDropzone && (
          <div
            {...getRootProps()}
            className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the files here ...</p>
            ) : (
              <p>
                Drag 'n' drop some files here, or click to select files
              </p>
            )}
          </div>
        )}

        {/* Album Auto-scroller */}
        {/* ...existing code for auto-scroller... */}

        {/* Pagination */}
        {/* ...existing code for pagination... */}
      </section>
    </div>
  );
};

export default Home2D;
