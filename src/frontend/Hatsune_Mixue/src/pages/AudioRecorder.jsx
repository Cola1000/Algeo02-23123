import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HillBackground from '../models/HillBackground.jsx';
import { applyTheme } from '../components/CheckTheme.jsx'

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingText, setRecordingText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      })
      .catch((err) => {
        alert('Microphone access denied.');
        console.error(err);
      });
    applyTheme();
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        const url = URL.createObjectURL(e.data);
        setAudioURL(url);
      };

      setTimeout(() => {
        stopRecording();
      }, 12100);

      setRecordingText("Recording...");
      setTimeout(() => setRecordingText("Keep Going..."), 4000);
      setTimeout(() => setRecordingText("Almost there..."), 8000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingText('');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-8 relative">
      <HillBackground />

      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 text-white-500 hover:underline"
      >
        &larr; Home
      </button>
      
      <h2 className="text-4xl font-bold mb-12">Audio Recognizer</h2>
      {!isRecording ? (
        <button
          onClick={startRecording}
          className="btn bg-blue-500 text-white shadow-md hover:shadow-lg mb-4"
          style={{ transform: 'translateY(-20px)' }}
        >
          Start Recording
        </button>
      ) : (
        <p
          className="text-lg font-semibold mb-4 flashing-text"
          style={{ transform: 'translateY(-20px)' }}
        >
          {recordingText}
        </p>
      )}

      {audioURL && (
        <div className="mt-4">
          <p>Recorded Audio:</p>
          <audio controls src={audioURL}></audio>
        </div>
      )}

      <style jsx>{`
        @keyframes flashRed {
          0% { color: #ff0000; }
          25% { color: #cc0000; }
          50% { color: #ff4d4d; }
          75% { color: #cc0000; }
          100% { color: #ff0000; }
        }
        .flashing-text {
          animation: flashRed 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
