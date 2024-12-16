// AudioRecorder.jsx
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
      const response = await axios.post(
        "http://localhost:8000/search-audio/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setPopupData(response.data.results);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error processing humming:", error);
      alert("There was an error processing your humming.");
    }
  };

  // Handle Audio File Upload
  const onDrop = useCallback(async (acceptedFiles) => {
    const audioFiles = acceptedFiles.filter((file) =>
      file.type.startsWith("audio/")
    );
    if (audioFiles.length === 0) {
      alert("Please upload valid audio files.");
      return;
    }
    const file = audioFiles[0];
    const formData = new FormData();
    formData.append("audio_file", file);

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
      setPopupData(response.data.results);
      setIsPopupVisible(true);
    } catch (error) {
      console.error("Error uploading audio:", error);
      alert("There was an error uploading your audio.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "audio/*",
  });

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 relative">
      <HillBackground />

      {/* Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 right-4 text-white-500 hover:underline"
      >
        &larr; Home
      </button>

      <h2 className="text-4xl font-bold mb-12">Audio Recognizer</h2>
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="btn bg-blue-500 text-white shadow-md hover:shadow-lg mb-4"
          style={{ transform: "translateY(-20px)" }}
        >
          Start Recording
        </button>
      ) : (
        <p
          className="text-lg font-semibold mb-4 flashing-text"
          style={{ transform: "translateY(-20px)" }}
        >
          {recordingText}
        </p>
      )}

      {/* Audio Playback */}
      {audioURL && (
        <div className="mt-4">
          <p>Recorded Audio:</p>
          <audio controls src={audioURL}></audio>

          {/* Display Humming Results */}
          {isPopupVisible && popupData && (
            <div className="search-results mt-8">
              <h2 className="text-xl font-bold mb-4">Humming Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {popupData.map((album) => (
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
        </div>
      )}

      {/* Upload Audio File */}
      <div
        {...getRootProps()}
        className="mt-8 border-4 border-dashed border-gray-300 rounded p-8 cursor-pointer"
      >
        <p>You can also upload an audio file</p>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the audio file here ...</p>
        ) : (
          <p>Drag 'n' drop an audio file here, or click to select one</p>
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
      `}</style>
    </div>
  );
};

export default AudioRecorder;
