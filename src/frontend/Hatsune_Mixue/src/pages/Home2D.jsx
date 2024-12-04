import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import albumPictures from "./albumPictures.jsx";

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
  const currentAlbums = albumPictures.slice(
    indexOfFirstAlbum,
    indexOfLastAlbum
  );

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
      navigate("/audio-recorder");
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
              <p>Drag 'n' drop some files here, or click to select files</p>
            )}
          </div>
        )}

        {/*Album Auto-scroller*/}
        <div className="mt-16 w-full max-w-screen-lg overflow-hidden z-0 relative">
          <div className="scroller flex gap-4 items-center flex-nowrap animate-auto-scroll">
            {albumPictures.length > 0
              ? [...Array(20)].map((_, index) => (
                  <div
                    key={index}
                    className="custom-glow w-48 h-48 flex-shrink-0 scale-90 cursor-pointer transition-transform transform hover:scale-100"
                  >
                    <img
                      src={
                        albumPictures[index % albumPictures.length].imageSrc // Repeat the same image if there's only one
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
