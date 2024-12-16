import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import albumPictures from "../components/albumPictures.jsx";
import HillBackground from "../models/HillBackground.jsx";
import { applyTheme } from "../components/CheckTheme.jsx";
import axios from "axios";

const Home2D = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 16;

  // States for Zip Files
  const [selectedZipFiles, setSelectedZipFiles] = useState([]);
  const [showZipDropzone, setShowZipDropzone] = useState(false);

  // States for Image Upload
  const [selectedImageFiles, setSelectedImageFiles] = useState([]);
  const [showImageDropzone, setShowImageDropzone] = useState(false);

  // States for Audio Upload
  const [selectedAudioFiles, setSelectedAudioFiles] = useState([]);
  const [showAudioDropzone, setShowAudioDropzone] = useState(false);

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

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
    setShowZipDropzone(false);
    setShowImageDropzone(true);
    setShowAudioDropzone(false);
  };

  // Handles the Zip File Recognizer button click
  const handleZipRecognizer = () => {
    setShowZipDropzone(true);
    setShowImageDropzone(false);
    setShowAudioDropzone(false);
  };

  // Handles the Audio Query button click
  const handleAudioRecognizer = () => {
    navigate('/audio-recorder');
  };

  // Drag and drop logic for Zip Files
  const onZipDrop = useCallback(async (acceptedFiles) => {
    const zipFiles = acceptedFiles.filter((file) => file.name.endsWith(".zip"));
    if (zipFiles.length === 0) {
      alert("Please upload a valid .zip file.");
      return;
    }
    setSelectedZipFiles(zipFiles);
    alert(`You have uploaded ${zipFiles.length} .zip file(s).`);
    setShowZipDropzone(false);

    // Prepare form data
    const formData = new FormData();
    zipFiles.forEach((file) => {
      formData.append("zip_files", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/upload-dataset/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Upload Success:", response.data);
      alert("Zip files uploaded successfully!");
      // Handle success (e.g., update state, notify user)
    } catch (error) {
      console.error("Upload Error:", error);
      alert("There was an error uploading your zip files.");
    }
  }, []);

  const {
    getRootProps: getZipRootProps,
    getInputProps: getZipInputProps,
    isDragActive: isZipDragActive,
  } = useDropzone({ onDrop: onZipDrop, disabled: !showZipDropzone });

  // Drag and drop logic for Image Upload
  const onImageDrop = useCallback(async (acceptedFiles) => {
    const imageFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    if (imageFiles.length === 0) {
      alert("Please upload valid image files.");
      return;
    }
    setSelectedImageFiles(imageFiles);
    alert(`You have uploaded ${imageFiles.length} image file(s).`);
    setShowImageDropzone(false);

    // Prepare form data
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append("query_image", file);
    });

    try {
      const response = await axios.post('http://localhost:8000/search-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image Query Success:', response.data);
      alert('Image query successful!');
      
      // Show popup with JSON data
      setPopupData(response.data);
      setIsPopupVisible(true);
    } catch (error) {
      console.error('Image Query Error:', error);
      alert('There was an error processing your image query.');
    }
  }, []);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({ onDrop: onImageDrop, disabled: !showImageDropzone });

  // Drag and drop logic for Audio Upload
  const onAudioDrop = useCallback(async (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("audio/")
    );
    if (audioFiles.length === 0) {
      alert("Please upload valid audio files.");
      return;
    }
    setSelectedAudioFiles(audioFiles);
    alert(`You have uploaded ${audioFiles.length} audio file(s).`);
    setShowAudioDropzone(false);

    // Prepare form data
    const formData = new FormData();
    audioFiles.forEach((file) => {
      formData.append("audio_file", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/search-audio/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("Audio Query Success:", response.data);
      alert("Audio query successful!");
      // Handle success (e.g., display results)
    } catch (error) {
      console.error("Audio Query Error:", error);
      alert("There was an error processing your audio query.");
    }
  }, []);

  const {
    getRootProps: getAudioRootProps,
    getInputProps: getAudioInputProps,
    isDragActive: isAudioDragActive,
  } = useDropzone({ onDrop: onAudioDrop, disabled: !showAudioDropzone });

  useEffect(() => {
    applyTheme(); // Check and apply the theme on page load
  }, []);

  // Close Popup
  const closePopup = () => {
    setIsPopupVisible(false);
    setPopupData(null);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 overflow-y-auto">
      <HillBackground />
      <section className="text-center">
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-6 shadow-card">
          Hatsune Mix[ue]
        </h1>

        {/* Action Buttons */}
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

        {/* Drag and Drop Area for Images */}
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

        {/* Drag and Drop Area for Zip Files */}
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

        {/* Drag and Drop Area for Audio Files */}
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

        {/* Album Auto-scroller */}
        <div className="mt-16 w-full max-w-screen-lg overflow-hidden z-0 relative">
          <div className="scroller flex gap-4 items-center flex-nowrap animate-auto-scroll">
            {albumPictures.length > 0
              ? [...Array(100)].map((_, index) => (
                  <div
                    key={index}
                    className="custom-glow w-48 h-48 flex-shrink-0 scale-90 cursor-pointer transition-transform transform hover:scale-100"
                  >
                    <img
                      src={albumPictures[index % albumPictures.length].imageSrc}
                      alt={`Album ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))
              : null}
          </div>
        </div>

        {/* Popup Modal */}
        {isPopupVisible && popupData && (
          <div className="modal-overlay fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="modal-content bg-white p-6 rounded-lg max-w-lg w-full">
              <h2 className="text-xl font-bold mb-4">Search Results</h2>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80">
                {JSON.stringify(popupData, null, 2)}
              </pre>
              <button
                onClick={closePopup}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Display Search Results as Albums */}
        {popupData && popupData.results && (
          <div className="search-results mt-8">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popupData.results.map((album) => (
                <div
                  key={album.id}
                  className="album-card w-48 h-48 cursor-pointer transition-transform transform hover:scale-105"
                >
                  <img
                    src={`http://localhost:8000/static/${album.imageSrc
                      .split("/")
                      .pop()}`}
                    alt={`Album ${album.title}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <p className="mt-2 text-center">{album.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

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
