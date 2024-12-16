// src/pages/Home2D.jsx
import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import albumPictures from "../components/albumPictures.jsx";
import HillBackground from "../models/HillBackground.jsx";
import { applyTheme } from '../components/CheckTheme.jsx';
import axios from 'axios';

const Home2D = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 16;

  const [showZipDropzone, setShowZipDropzone] = useState(false);
  const [showImageDropzone, setShowImageDropzone] = useState(false);
  const [showAudioDropzone, setShowAudioDropzone] = useState(false);

  const totalPages = Math.ceil(albumPictures.length / albumsPerPage);
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = albumPictures.slice(indexOfFirstAlbum, indexOfLastAlbum);

  const handleAlbumClick = (albumId) => {
    navigate(`/album/${albumId}`);
  };

  const handleAlbumRecognizer = () => {
    setShowZipDropzone(false);
    setShowImageDropzone(true);
    setShowAudioDropzone(false);
  };

  const handleZipRecognizer = () => {
    setShowZipDropzone(true);
    setShowImageDropzone(false);
    setShowAudioDropzone(false);
  };

  const handleAudioRecognizer = () => {
    setShowAudioDropzone(true);
    setShowZipDropzone(false);
    setShowImageDropzone(false);
  };

  const onZipDrop = useCallback(async (acceptedFiles) => {
    const zipFiles = acceptedFiles.filter(file => file.name.endsWith('.zip'));
    if (zipFiles.length === 0) {
      alert("Please upload a valid .zip file.");
      return;
    }
    alert(`You have uploaded ${zipFiles.length} .zip file(s).`);
    setShowZipDropzone(false);

    const formData = new FormData();
    zipFiles.forEach(file => {
      formData.append('zip_file', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/upload-dataset/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Upload Success:', response.data);
      alert('Zip files uploaded successfully!');
    } catch (error) {
      console.error('Upload Error:', error);
      alert('There was an error uploading your zip files.');
    }
  }, []);

  const { getRootProps: getZipRootProps, getInputProps: getZipInputProps, isDragActive: isZipDragActive } = useDropzone({ onDrop: onZipDrop, disabled: !showZipDropzone });

  const onImageDrop = useCallback(async (acceptedFiles) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      alert("Please upload valid image files.");
      return;
    }
    alert(`You have uploaded ${imageFiles.length} image file(s).`);
    setShowImageDropzone(false);

    const formData = new FormData();
    imageFiles.forEach(file => {
      formData.append('query_image', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/search-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image Query Success:', response.data);
      alert('Image query successful!');
    } catch (error) {
      console.error('Image Query Error:', error);
      alert('There was an error processing your image query.');
    }
  }, []);

  const { getRootProps: getImageRootProps, getInputProps: getImageInputProps, isDragActive: isImageDragActive } = useDropzone({ onDrop: onImageDrop, disabled: !showImageDropzone });

  const onAudioDrop = useCallback(async (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter(file => file.type.startsWith('audio/'));
    if (audioFiles.length === 0) {
      alert("Please upload valid audio files.");
      return;
    }
    alert(`You have uploaded ${audioFiles.length} audio file(s).`);
    setShowAudioDropzone(false);

    const formData = new FormData();
    audioFiles.forEach(file => {
      formData.append('audio_file', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/search-audio/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Audio Query Success:', response.data);
      alert('Audio query successful!');
    } catch (error) {
      console.error('Audio Query Error:', error);
      alert('There was an error processing your audio query.');
    }
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDragActive } = useDropzone({ onDrop: onAudioDrop, disabled: !showAudioDropzone });

  useEffect(() => {
    applyTheme();
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 overflow-y-auto">
      <HillBackground />
      <section className="text-center">
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-6 shadow-card">
          Hatsune Mix[ue]
        </h1>

        <div className="flex flex-wrap gap-5 mt-8 z-10 relative justify-center items-center">
          <button
            onClick={handleAlbumRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center"
          >
            Album Picture Recognizer
          </button>
          <button
            onClick={handleAudioRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center"
          >
            Audio Recognizer
          </button>
          <button
            onClick={handleZipRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center"
          >
            Upload a Database (Zip)
          </button>
        </div>

        {showImageDropzone && (
          <div
            {...getImageRootProps()}
            className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer"
          >
            <input {...getImageInputProps()} />
            {isImageDragActive ? (
              <p>Drop the image files here ...</p>
            ) : (
              <p>Drag 'n' drop image files here, or click to select files</p>
            )}
          </div>
        )}

        {showZipDropzone && (
          <div
            {...getZipRootProps()}
            className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer"
          >
            <input {...getZipInputProps()} />
            {isZipDragActive ? (
              <p>Drop the zip file here ...</p>
            ) : (
              <p>Drag 'n' drop a .zip file here, or click to select one</p>
            )}
          </div>
        )}

        {showAudioDropzone && (
          <div
            {...getAudioRootProps()}
            className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer"
          >
            <input {...getAudioInputProps()} />
            {isAudioDragActive ? (
              <p>Drop the audio files here ...</p>
            ) : (
              <p>Drag 'n' drop audio files here, or click to select one</p>
            )}
          </div>
        )}

        <div className="mt-16 w-full max-w-screen-lg overflow-hidden z-0 relative">
          <div className="scroller flex gap-4 items-center flex-nowrap animate-auto-scroll">
            {albumPictures.length > 0
              ? [...Array(100)].map((_, index) => (
                  <div
                    key={index}
                    className="custom-glow w-48 h-48 flex-shrink-0 scale-90 cursor-pointer transition-transform transform hover:scale-100"
                  >
                    <img
                      src={
                        albumPictures[index % albumPictures.length].imageSrc
                      }
                      alt={`Album ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>

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

          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mx-2 px-4 py-2 w-32 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-200 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="mx-2 px-4 py-2 w-32 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-200 disabled:opacity-50"
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
