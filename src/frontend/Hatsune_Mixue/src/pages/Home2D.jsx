import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import albumPictures from "../components/albumPictures.jsx";
import HillBackground from "../models/HillBackground.jsx";
import { applyTheme } from "../components/CheckTheme.jsx";
import axios from "axios";

const Home2D = () => {
  const BACKEND_STATIC_URL = "http://localhost:8000/static/";
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const albumsPerPage = 16;

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedAudios, setUploadedAudios] = useState([]);
  const [uploadedMapper, setUploadedMapper] = useState(null);

  const albumsSectionRef = useRef(null);
  const datasetStatusRef = useRef(null);
  const uploadSectionRef = useRef(null);

  const [datasetStatus, setDatasetStatus] = useState({
    images: false,
    audios: false,
    mapper: false,
  });

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
  const totalPages = Math.ceil(uploadedImages.length / albumsPerPage);

  // Get current albums
  const indexOfLastAlbum = currentPage * albumsPerPage;
  const indexOfFirstAlbum = indexOfLastAlbum - albumsPerPage;
  const currentAlbums = uploadedImages.slice(indexOfFirstAlbum, indexOfLastAlbum);

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
    navigate("/audio-recorder");
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
      const response = await axios.post("http://localhost:8000/upload-dataset/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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
    const imageFiles = acceptedFiles.filter((file) => file.type.startsWith("image/"));
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
      const response = await axios.post("http://localhost:8000/search-image/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Image Query Success:", response.data);
      alert("Image query successful!");

      // Show popup with JSON data
      setPopupData(response.data);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Image Query Error:", error);
      alert("There was an error processing your image query.");
    }
  }, []);

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({ onDrop: onImageDrop, disabled: !showImageDropzone });

  // Drag and drop logic for Audio Upload
  const onAudioDrop = useCallback(async (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) => file.type.startsWith("audio/"));
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
      const response = await axios.post("http://localhost:8000/search-audio/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
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

  useEffect(() => {
    const fetchDatasetStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8000/check-datasets/");
        setDatasetStatus(response.data);
      } catch (error) {
        console.error("Error fetching dataset status:", error);
        // Optionally, handle the error (e.g., show a notification)
      }
    };

    fetchDatasetStatus();
  }, []);

  useEffect(() => {
    const fetchUploadedData = async () => {
      try {
        const imagesResponse = await axios.get("http://localhost:8000/api/uploaded-images/");
        const audiosResponse = await axios.get("http://localhost:8000/api/uploaded-audios/");
        const mapperResponse = await axios.get("http://localhost:8000/api/uploaded-mapper/");

        setUploadedImages(imagesResponse.data.uploaded_images || []);
        setUploadedAudios(audiosResponse.data.uploaded_audios || []);
        setUploadedMapper(mapperResponse.data.uploaded_mapper || []);

        console.log("Uploaded Images:", imagesResponse.data);
        console.log("Uploaded Audios:", audiosResponse.data);
        console.log("Uploaded Mapper:", mapperResponse.data);
      } catch (error) {
        console.error("Error fetching uploaded data:", error);
      }
    };

    fetchUploadedData();
  }, []);

  useEffect(() => {
    if (!datasetStatus.images || !datasetStatus.audios || !datasetStatus.mapper) {
      // Scroll to Dataset Status if any dataset is missing
      datasetStatusRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      // Scroll to Albums Section if all datasets are present
      // Replace 'albumsSectionRef' with your actual ref for the albums section
      albumsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [datasetStatus]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8 overflow-y-auto">
      <HillBackground />
      <section className="text-center">
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-6 shadow-card">Hatsune Mix[ue]</h1>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-5 mt-8 z-10 relative justify-center items-center">
          <button
            onClick={handleAlbumRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center">
            Album Picture Recognizer
          </button>
          <button
            onClick={handleAudioRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center">
            Audio Recognizer
          </button>
          <button
            onClick={handleZipRecognizer}
            className="btn shadow-md hover:shadow-lg bg-blue-500 text-white py-2 px-4 rounded-lg min-w-[250px] text-center">
            Upload a Database (Zip)
          </button>
        </div>

        {/* Drag and Drop Area for Images */}
        {showImageDropzone && (
          <div {...getImageRootProps()} className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer">
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
          <div {...getZipRootProps()} className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer">
            <input {...getZipInputProps()} />
            {isZipDragActive ? <p>Drop the zip file here ...</p> : <p>Drag 'n' drop a .zip file here, or click to select one</p>}
          </div>
        )}

        {/* Drag and Drop Area for Audio Files */}
        {showAudioDropzone && (
          <div {...getAudioRootProps()} className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer">
            <input {...getAudioInputProps()} />
            {isAudioDragActive ? (
              <p>Drop the audio files here ...</p>
            ) : (
              <p>Drag 'n' drop audio files here, or click to select one</p>
            )}
          </div>
        )}

        {/* Display Search Results as Albums */}
        {popupData && popupData.results && (
          <div className="search-results mt-8">
            <h2 className="text-xl font-bold mb-4">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
              {popupData.results.map((album) => (
                <div
                  key={album.id}
                  className="album-card w-48 h-48 cursor-pointer transition-transform transform hover:scale-105">
                  <img
                    src={`http://localhost:8000/static/${album.imageSrc.split("/").pop()}`}
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
          <div ref={albumsSectionRef} className="mt-16 w-full max-w-screen-lg overflow-hidden relative">
            <h2 className="text-3xl font-bold mb-4">Your Datasets</h2>

            {datasetStatus.images && datasetStatus.mapper ? (
              uploadedMapper ? (
                <div className="flex gap-4 items-start flex-wrap overflow-x-auto whitespace-nowrap flex-row">
                  {currentAlbums.map((image, index) => (
                    <div key={index} className="album-card w-48 h-48 flex-shrink-0 relative">
                      <img
                        src={`${BACKEND_STATIC_URL}${image.imageSrc.split("/").pop()}`}
                        alt={`Uploaded Album ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p>Error Displaying Datasets.</p>
              )
            ) : (
              <div className="w-full text-red-500 text-center">
                <p>
                  Missing datasets: {!datasetStatus.images && "Images "}
                  {!datasetStatus.audios && "Audios "}
                  {!datasetStatus.mapper && "Mapper "}
                </p>
                <p>Please upload all required datasets (Images, Audios, and Mapper) to display your albums.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mx-2 px-4 py-2 w-32 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-200 disabled:opacity-50">
              Previous
            </button>
            <span className="mx-2">{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="mx-2 px-4 py-2 w-32 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-200 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home2D;
