import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HillBackground from "../models/HillBackground.jsx";
import { applyTheme } from "../components/CheckTheme.jsx";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("");
  const [popupData, setPopupData] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
          const url = URL.createObjectURL(e.data);
          setAudioURL(url);
          uploadAudio(e.data);
        };
        setMediaRecorder(recorder);
      })
      .catch((err) => {
        alert("Microphone access denied.");
        console.error(err);
      });
    applyTheme();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingText("Recording...");
      setTimeout(() => setRecordingText("Keep Going..."), 4000);
      setTimeout(() => setRecordingText("Almost there..."), 8000);
      setTimeout(() => stopRecording(), 12000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingText("");
    }
  };

  const uploadAudio = async (audioBlob) => {
    const formData = new FormData();
    formData.append("audio_file", audioBlob, "recorded_audio.wav");

    try {
      const response = await axios.post("http://localhost:8000/search-audio/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Upload Audio Response:", response.data);
      setPopupData(response.data.results);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error processing humming:", error);
      alert("There was an error processing your humming.");
    }
  };

  // Handle Audio File Upload via Drag and Drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
      alert("Please upload valid audio files.");
      return;
    }
    const file = audioFiles[0];
    const formData = new FormData();
    formData.append("query_audio", file);

    console.log("Uploading audio file via drag-and-drop:", file);

    try {
      const response = await axios.post("http://localhost:8000/search-audio/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Drag and Drop Upload Response:", response.data);
      setPopupData(response.data.results);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error uploading audio via drag-and-drop:", error);
      alert("There was an error uploading your audio.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "audio/*",
  });

  useEffect(() => {
    console.log("Popup Data:", popupData);
  }, [popupData]);

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 relative">
      <HillBackground />

      {/* Home Button */}
      <button onClick={() => navigate("/")} className="absolute top-4 right-4 text-white-500 hover:underline">
        &larr; Home
      </button>

      <h2 className="text-4xl font-bold mb-12 text-white-800">Audio Recognizer</h2>
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="btn bg-blue-500 text-white shadow-md hover:shadow-lg mb-4 transform translate-y-[-20px] px-6 py-2 rounded-lg">
          Start Recording
        </button>
      ) : (
        <p className="text-lg font-semibold mb-4 flashing-text transform translate-y-[-20px] text-red-600">{recordingText}</p>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-4 text-center">
          <p className="mb-2 text-gray-700">Recorded Audio:</p>
          <audio controls src={audioURL} className="w-full max-w-md mx-auto rounded-lg shadow-lg"></audio>
        </div>
      )}

      {/* Display Audio Search Results */}
      {isPopupVisible && Array.isArray(popupData) && (
        <div className="search-results mt-8 p-6 bg-white bg-opacity-90 rounded-xl shadow-2xl">
          <h2 className="text-2xl font-semibold mb-6 text-center text-blue-600">Audio Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {popupData.map((album) => (
              <div
                key={album.id}
                className="album-card bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer">
                <img
                  src={`http://localhost:8000/static/${album.imageSrc.split("/").pop()}`}
                  alt={`Album ${album.title}`}
                  className="w-full h-40 object-cover"
                />
                <div className="p-4">
                  <p className="mt-2 text-center font-medium text-gray-800">{album.title}</p>
                  {/* Display Songs of the Album */}
                  {Array.isArray(album.songs) && (
                    <div className="mt-4">
                      {album.songs.map((song, index) => (
                        <div key={song.id} className="song-card bg-gray-50 rounded-lg overflow-hidden shadow-md p-4 mb-4">
                          <p className="text-lg font-medium text-gray-800">{`Song ${index + 1}: ${song.file}`}</p>
                          <p className="text-sm text-gray-600">{`Similarity Ranking: ${song.similarityRanking}`}</p>
                          <p className="text-sm text-gray-600">{`Similarity Percentage: ${song.similarityPercentage}%`}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Audio File via Drag and Drop */}
      <div
        {...getRootProps()}
        className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-500">Drop the audio file here ...</p>
        ) : (
          <p className="text-gray-700">Drag 'n' drop an audio file here, or click to select one</p>
        )}
      </div>

      <style jsx>{`
        @keyframes flashRed {
          0% {
            color: #ff0000;
          }
          25% {
            color: #cc0000;
          }
          50% {
            color: #ff4d4d;
          }
          75% {
            color: #cc0000;
          }
          100% {
            color: #ff0000;
          }
        }

        .flashing-text {
          animation: flashRed 4s infinite;
        }

        .search-results {
          /* Styles are managed by Tailwind classes */
        }

        .album-card img {
          /* Styles are managed by Tailwind classes */
        }

        .album-card:hover img {
          /* Styles are managed by Tailwind classes */
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
