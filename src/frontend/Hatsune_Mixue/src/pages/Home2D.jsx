import albumPictures from './albumPictures.jsx';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home2D = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 8;

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
    alert("Please drag and drop a file or select a file from your computer.");
    // Logic for file selection or drag-and-drop can be implemented here
  };

  const handleEnter3DView = () => {
    navigate('/Home3D');
  };

  // Handles the Audio Recognizer button click
  const handleAudioRecognizer = () => {
    const useMicrophone = window.confirm(
      "Do you want to use your microphone for audio recognition?"
    );
    if (useMicrophone) {
      alert("Microphone access requested.");
      // Logic to access microphone goes here
    } else {
      alert("Please select an audio file.");
      // Logic to upload an audio file goes here
    }
  };

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <section className="text-center">
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-6 shadow-card">
          Hatsune Mixue
        </h1>

        {/*Button Submitter*/}
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

        {/*Album Auto-scroller*/}
        <div className="mt-16 w-full max-w-screen-lg overflow-hidden z-0 relative">
          <div className="scroller flex gap-4 items-center flex-nowrap animate-auto-scroll">
            {albumPictures.length > 0
              ? [...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className="custom-glow w-48 h-48 flex-shrink-0 cursor-pointer transition-transform transform hover:scale-110"
                  >
                    <img
                      src={
                        albumPictures[index % albumPictures.length] // Repeat the same image if there's only one
                      }
                      alt={`Album ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>

        {/* Pagination */}
        <div className="mt-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {currentAlbums.map((album) => (
              <div
                key={album.id}
                className="w-48 h-48 cursor-pointer transition-transform transform hover:scale-105"
                onClick={() => handleAlbumClick(album.id)}
              >
                <img
                  src={album.imageSrc}
                  alt={`Album ${album.title}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mx-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="mx-2 px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home2D;
