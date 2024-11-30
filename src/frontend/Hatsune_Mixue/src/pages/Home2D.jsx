import React from 'react';
import albumPictures from './albumPictures.jsx';

const Home2D = () => {
  // Handles the Album Picture Recognizer button click
  const handleAlbumRecognizer = () => {
    alert("Please drag and drop a file or select a file from your computer.");
    // Logic for file selection or drag-and-drop can be implemented here
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
        <h1 className="head-text text-cool-blue rounded-lg px-6 py-4 shadow-card">
          Hatsune Mixue
        </h1>

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

      </section>
    </div>
  );
};

export default Home2D;
