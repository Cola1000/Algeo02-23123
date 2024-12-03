import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AudioRecorder = () => {
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
      })
      .catch((err) => {
        alert('Microphone access denied.');
        console.error(err);
      });
  }, []);

  const startRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.start();
      setIsRecording(true);

      mediaRecorder.ondataavailable = (e) => {
        const url = URL.createObjectURL(e.data);
        setAudioURL(url);
      };
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center p-8">
      {/* Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 text-blue-500 hover:underline"
      >
        &larr; Home
      </button>
      <h2 className="text-2xl font-bold mb-4">Audio Recognizer</h2>
      {isRecording ? (
        <button
          onClick={stopRecording}
          className="btn bg-red-500 shadow-md hover:shadow-lg mb-4"
        >
          Stop Recording
        </button>
      ) : (
        <button
          onClick={startRecording}
          className="btn shadow-md hover:shadow-lg mb-4"
        >
          Start Recording
        </button>
      )}

      {audioURL && (
        <div className="mt-4">
          <p>Recorded Audio:</p>
          <audio controls src={audioURL}></audio>
          {/* Implement logic to process the audio */}
        </div>
      )}
    </div>
  );
};

export default AudioRecorder;
